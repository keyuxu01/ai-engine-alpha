---
name: nextjs-mcp-development
description: 开发 Next.js MCP Server 的完整指南。使用 mcp-handler 创建 MCP 端点、定义 Tools、处理响应格式。适用于新建 MCP Server、添加 Tool、调试连接问题或部署到 Vercel。
---

# Next.js MCP 开发指南

## 核心概念

MCP (Model Context Protocol) 是 AI Agent 与应用通信的开放标准。

```
┌─────────────┐        MCP         ┌─────────────────┐
│  AI Agent   │ ◄───────────────►  │  MCP Server     │
│  (Client)   │  tools/resources   │  (Next.js App)  │
└─────────────┘                    └─────────────────┘
```

---

## 项目结构

```
app/
└── api/
    └── [transport]/           # 动态路由，名称必须与 basePath 匹配
        ├── route.ts           # MCP Handler 入口
        └── mcp_server.ts      # Tool 实现
scripts/
└── test-mcp.mjs               # 测试脚本
.mcp.json                      # AI 客户端配置
```

---

## 创建 MCP Server 步骤

### 1. 安装依赖

```bash
npm install mcp-handler @modelcontextprotocol/sdk@1.26.0 zod
```

### 2. 创建动态路由

目录名必须与 `basePath` 匹配：

| basePath | 目录 |
|----------|------|
| `/api/mcp` | `app/api/mcp/[transport]/` |
| `/api/mcp-alpha` | `app/api/mcp-alpha/[transport]/` |

### 3. 定义 Tool Handler

```typescript
// mcp_server.ts
import { z } from 'zod';

const MY_TOOL = 'my_tool';

const myToolHandler = async ({ param1, param2 }: { param1: string; param2?: number }) => {
  // 业务逻辑
  return {
    structuredContent: { /* 结构化数据 */ },
    content: [{ type: 'text' as const, text: '结果文本' }],
  };
};

export { MY_TOOL, myToolHandler };
```

### 4. 创建 Route Handler

```typescript
// route.ts
import { createMcpHandler } from 'mcp-handler';
import { z } from 'zod';
import { MY_TOOL, myToolHandler } from './mcp_server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const handler = createMcpHandler(
  async (server) => {
    server.registerTool(
      MY_TOOL,
      {
        title: 'My Tool',
        description: '工具描述，说明用途',
        inputSchema: {
          param1: z.string().describe('参数1说明'),
          param2: z.number().optional().describe('参数2说明'),
        },
        annotations: {
          readOnlyHint: true,
          openWorldHint: false,
          destructiveHint: false,
        },
      },
      myToolHandler,
    );
  },
  { serverInfo: { name: 'my-mcp-server', version: '1.0.0' } },
  { basePath: '/api/mcp', verboseLogs: true, disableSse: true },
);

export { handler as GET, handler as POST };
```

---

## 响应格式

### 成功响应

```typescript
return {
  structuredContent: { /* 机器可读数据 */ },
  content: [{ type: 'text' as const, text: '人类可读文本' }],
};
```

### 错误响应

```typescript
return {
  isError: true,
  content: [{ type: 'text' as const, text: '错误信息' }],
  structuredContent: { error: '错误详情' },
};
```

---

## 常见问题

| 问题 | 解决方案 |
|------|----------|
| 无法连接 | 检查 `dynamic = 'force-dynamic'` 和 `runtime = 'nodejs'` |
| Tool 不生效 | 确认 `basePath` 与目录名匹配 |
| 需要认证 | 参考 mcp-handler 授权文档 |

---

## 参考

详细文档: [docs/nextjs-mcp-development-guide.md](docs/nextjs-mcp-development-guide.md)
