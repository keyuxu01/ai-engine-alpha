# Next.js MCP 开发完全指南

> 本文档将帮助你从零开始开发一个 Next.js MCP Server，包含完整的代码示例和配置说明。

---

## 目录

1. [什么是 MCP](#1-什么是-mcp)
2. [前置要求](#2-前置要求)
3. [核心概念](#3-核心概念)
4. [项目结构](#4-项目结构)
5. [安装依赖](#5-安装依赖)
6. [创建 MCP Handler](#6-创建-mcp-handler)
7. [定义 Tool](#7-定义-tool)
8. [响应格式](#8-响应格式)
9. [配置路由](#9-配置路由)
10. [测试 MCP Server](#10-测试-mcp-server)
11. [连接 AI 客户端](#11-连接-ai-客户端)
12. [部署到 Vercel](#12-部署到-vercel)
13. [常见问题](#13-常见问题)

---

## 1. 什么是 MCP

**MCP (Model Context Protocol)** 是一个开放标准，允许 AI Agent 与你的应用进行标准化交互。

### MCP 工作流程

```
┌─────────────┐         MCP 协议          ┌─────────────────┐
│   AI Agent  │ ◄───────────────────────► │   MCP Server    │
│  (Client)   │   tools/call, resources   │   (你的应用)     │
└─────────────┘                           └─────────────────┘
```

### MCP 能做什么

| 能力          | 说明                      |
| ------------- | ------------------------- |
| **Tools**     | AI 可以调用函数执行操作   |
| **Resources** | AI 可以读取只读数据       |
| **Prompts**   | AI 可以使用预设提示词模板 |

---

## 2. 前置要求

- **Node.js** 18+
- **Next.js** 13+ (推荐 15/16)
- **npm** / **pnpm** / **yarn**

---

## 3. 核心概念

### 传输协议

MCP 支持两种传输方式：

| 协议                | 说明                           | 适用场景                 |
| ------------------- | ------------------------------ | ------------------------ |
| **Streamable HTTP** | 基于 HTTP 的请求-响应模式      | 推荐，支持有状态和无状态 |
| **SSE**             | Server-Sent Events，服务器推送 | 需要实时更新的场景       |

### 目录结构

```
nextjs-app/
├── app/
│   └── api/
│       └── [transport]/          # 动态路由
│           ├── route.ts          # MCP Handler 入口
│           └── mcp_server.ts     # Tool 实现
├── scripts/
│   └── test-mcp.mjs              # 测试脚本
└── .mcp.json                     # MCP 客户端配置
```

---

## 4. 项目结构

### 创建新的 Next.js 项目

```bash
npx create-next-app@latest my-mcp-app --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --turbopack
```

### 在现有项目中添加 MCP

如果你已有 Next.js 项目，直接跳到第 5 步。

---

## 5. 安装依赖

```bash
npm install mcp-handler @modelcontextprotocol/sdk@1.25.2 zod
```

> ⚠️ **重要**: `@modelcontextprotocol/sdk` 使用 1.25.2， cp-handler 配合使用。

---

## 6. 创建 MCP Handler

### 6.1 创建动态路由目录

```bash
mkdir -p app/api/mcp/[transport]
```

### 6.2 创建 Tool 实现文件

创建 `app/api/mcp/[transport]/mcp_server.ts`:

```typescript
import { z } from 'zod';

// ─── 定义 Tool 名称常量 ─────────────────────────────────────────────
const SEARCH_FLIGHTS_TOOL = 'search_flights';
const GET_FLIGHT_DETAIL_TOOL = 'get_flight_detail';

// ─── Tool Handler 实现 ─────────────────────────────────────────────

const searchFlightsHandler = async ({
  departure,
  arrival,
}: {
  departure?: string;
  arrival?: string;
}) => {
  // 模拟数据，实际项目中从数据库或 API 获取
  const mockFlights = [
    {
      id: 'f1',
      flightNumber: 'CA1234',
      departure: '北京',
      arrival: '上海',
      departureTime: '08:00',
      arrivalTime: '10:30',
      price: 680,
    },
    {
      id: 'f2',
      flightNumber: 'MU5678',
      departure: '北京',
      arrival: '上海',
      departureTime: '14:00',
      arrivalTime: '16:30',
      price: 720,
    },
  ];

  let flights = mockFlights;

  // 按条件过滤
  if (departure) {
    flights = flights.filter(f =>
      f.departure.toLowerCase().includes(departure.toLowerCase()),
    );
  }
  if (arrival) {
    flights = flights.filter(f =>
      f.arrival.toLowerCase().includes(arrival.toLowerCase()),
    );
  }

  return {
    structuredContent: {
      flights,
      flightIds: flights.map(f => f.id),
      totalCount: flights.length,
    },
    content: [
      {
        type: 'text' as const,
        text:
          flights.length === 0
            ? '未找到符合条件的航班'
            : [
                `找到 ${flights.length} 个航班：`,
                ...flights.map(
                  (f, i) =>
                    `${i + 1}. ${f.flightNumber} | ${f.departure} → ${f.arrival} | ¥${f.price}`,
                ),
              ].join('\n'),
      },
    ],
  };
};

const getFlightDetailHandler = async ({ id }: { id: string }) => {
  const flight = {
    id,
    flightNumber: 'CA1234',
    departure: '北京',
    arrival: '上海',
    price: 680,
  };

  if (!flight) {
    return {
      isError: true,
      content: [{ type: 'text' as const, text: `未找到航班: ${id}` }],
    };
  }

  return {
    structuredContent: { flight },
    content: [
      {
        type: 'text' as const,
        text: `航班号: ${flight.flightNumber}\n航线: ${flight.departure} → ${flight.arrival}\n价格: ¥${flight.price}`,
      },
    ],
  };
};

export {
  SEARCH_FLIGHTS_TOOL,
  GET_FLIGHT_DETAIL_TOOL,
  searchFlightsHandler,
  getFlightDetailHandler,
};
```

---

## 7. 定义 Tool

### 7.1 创建 Route Handler

创建 `app/api/mcp/[transport]/route.ts`:

```typescript
import { createMcpHandler } from 'mcp-handler';
import { z } from 'zod';
import {
  SEARCH_FLIGHTS_TOOL,
  GET_FLIGHT_DETAIL_TOOL,
  searchFlightsHandler,
  getFlightDetailHandler,
} from './mcp_server';

// 强制动态渲染（必需）
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const handler = createMcpHandler(
  async server => {
    // ─── Tool 1: 搜索航班 ─────────────────────────────────────────
    server.registerTool(
      SEARCH_FLIGHTS_TOOL,
      {
        title: 'Search Flights',
        description: '搜索航班。返回航班列表和 flightIds。',
        inputSchema: {
          departure: z.string().optional().describe('出发城市，例如 "北京"'),
          arrival: z.string().optional().describe('到达城市，例如 "上海"'),
        },
        annotations: {
          readOnlyHint: true,
          openWorldHint: false,
          destructiveHint: false,
        },
      },
      searchFlightsHandler,
    );

    // ─── Tool 2: 获取航班详情 ──────────────────────────────────────
    server.registerTool(
      GET_FLIGHT_DETAIL_TOOL,
      {
        title: 'Get Flight Detail',
        description: '获取指定航班的详细信息。',
        inputSchema: {
          id: z.string().describe('航班 ID'),
        },
        annotations: {
          readOnlyHint: true,
          openWorldHint: false,
          destructiveHint: false,
        },
      },
      getFlightDetailHandler,
    );
  },
  // Server Info
  {
    serverInfo: {
      name: 'flight-mcp-server',
      version: '1.0.0',
    },
  },
  // Transport 配置
  {
    basePath: '/api/mcp',
    verboseLogs: true,
    disableSse: true, // 使用 Streamable HTTP
  },
);

export { handler as GET, handler as POST };
```

### 7.2 Tool 注解说明

| 注解              | 说明                            |
| ----------------- | ------------------------------- |
| `readOnlyHint`    | `true` = 只读操作，不会修改数据 |
| `openWorldHint`   | `true` = 会访问外部系统/网络    |
| `destructiveHint` | `true` = 会删除或修改数据       |

---

## 8. 响应格式

### 标准成功响应

```typescript
return {
  structuredContent: {
    // 机器可读的结构化数据
    flights: [...],
    totalCount: 10,
  },
  content: [
    {
      type: 'text' as const,
      text: '人类可读的摘要',  // AI 直接使用这个
    },
  ],
};
```

### 错误响应

```typescript
return {
  isError: true, // 必须设为 true
  content: [
    {
      type: 'text' as const,
      text: '错误信息',
    },
  ],
  structuredContent: {
    error: '错误详情',
  },
};
```

---

## 9. 配置路由

> ⚠️ **重要**: `[transport]` 目录名必须与 `basePath` 匹配。

### 路由匹配关系

| basePath         | 目录结构                                 | 完整 URL             |
| ---------------- | ---------------------------------------- | -------------------- |
| `/api/mcp`       | `app/api/mcp/[transport]/route.ts`       | `/api/mcp/mcp`       |
| `/api/mcp-alpha` | `app/api/mcp-alpha/[transport]/route.ts` | `/api/mcp-alpha/mcp` |

---

## 10. 测试 MCP Server

### 10.1 创建测试脚本

创建 `scripts/test-mcp.mjs`:

```javascript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const origin = process.argv[2] || 'http://localhost:3000/api/mcp/mcp';

async function main() {
  const transport = new StreamableHTTPClientTransport(new URL(origin));

  const client = new Client(
    { name: 'test-client', version: '1.0.0' },
    { capabilities: { prompts: {}, resources: {}, tools: {} } },
  );

  await client.connect(transport);

  // 1. 获取服务器能力
  console.log('Connected', client.getServerCapabilities());

  // 2. 列出所有工具
  const tools = await client.listTools();
  console.log('Tools:', JSON.stringify(tools, null, 2));

  // 3. 调用工具
  const result = await client.callTool({
    name: 'search_flights',
    arguments: { departure: '北京', arrival: '上海' },
  });
  console.log('Result:', JSON.stringify(result, null, 2));
}

main();
```

### 10.2 运行测试

```bash
# 启动 Next.js 开发服务器
npm run dev

# 在另一个终端运行测试脚本
node scripts/test-mcp.mjs
```

### 10.3 使用 curl 测试

```bash
# 列出工具
curl -X POST http://localhost:3000/api/mcp/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'

# 调用工具
curl -X POST http://localhost:3000/api/mcp/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"search_flights","arguments":{"departure":"北京"}}}'
```

---

## 11. 连接 AI 客户端

### 11.1 Cursor 配置

创建 `.mcp.json`:

```json
{
  "mcpServers": {
    "my-mcp-server": {
      "url": "http://localhost:3000/api/mcp/mcp"
    }
  }
}
```

### 11.2 Claude Desktop 配置

macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "my-mcp-server": {
      "url": "http://localhost:3000/api/mcp/mcp"
    }
  }
}
```

Windows: `%APPDATA%\Claude\claude_desktop_config.json`

### 11.3 GitHub Copilot 配置

在 VS Code 设置中 (`settings.json`):

```json
{
  "mcpServers": {
    "my-mcp-server": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "http://localhost:3000/api/mcp/mcp"]
    }
  }
}
```

### 11.4 使用 mcp-remote (stdio 客户端)

```bash
npm install -g mcp-remote
```

```json
{
  "mcpServers": {
    "remote-server": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "http://your-server.com/api/mcp/mcp"]
    }
  }
}
```

---

## 参考资源

| 资源                  | 链接                                           |
| --------------------- | ---------------------------------------------- |
| mcp-handler npm       | https://www.npmjs.com/package/mcp-handler      |
| mcp-handler 源码      | https://github.com/vercel/mcp-handler          |
| Vercel MCP 示例       | https://github.com/vercel-labs/mcp-for-next.js |
| Next.js MCP 指南      | https://nextjs.org/docs/app/guides/mcp         |
| MCP Protocol Spec     | https://modelcontextprotocol.io/specification  |
| ByteGrad YouTube 教程 | https://www.youtube.com/watch?v=LAxwvZUaaDE    |

---

## 完整项目示例

完整的示例项目结构：

```
my-mcp-app/
├── app/
│   └── api/
│       └── mcp/
│           └── [transport]/
│               ├── route.ts
│               └── mcp_server.ts
├── scripts/
│   └── test-mcp.mjs
├── .mcp.json
├── package.json
└── README.md
```

---

_文档版本: 1.0.0_
_最后更新: 2026-03-28_
