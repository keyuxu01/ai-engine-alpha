# Next.js MCP 开发参考文档

## mcp-handler 配置选项

```typescript
createMcpHandler(
  serverCallback,                    // 注册 Tools 的回调函数
  serverInfo,                        // 服务器信息
  {
    basePath: '/api/mcp',           // 必须与目录名匹配
    verboseLogs: false,             // 详细日志
    disableSse: true,               // true = Streamable HTTP, false = SSE
    maxDuration: 60,                // 最大请求超时（秒）
  }
)
```

## Tool Annotations

| 注解 | 类型 | 说明 |
|------|------|------|
| `readOnlyHint` | boolean | 是否只读，不会修改数据 |
| `openWorldHint` | boolean | 是否访问外部系统 |
| `destructiveHint` | boolean | 是否会删除数据 |

## 传输协议对比

| 协议 | 启用方式 | 需要 Redis | 适用场景 |
|------|----------|------------|----------|
| Streamable HTTP | `disableSse: true` | 否 | 推荐，无状态 |
| SSE | `disableSse: false` | 是 | 需要实时推送 |

## 客户端配置

### Cursor (.mcp.json)

```json
{
  "mcpServers": {
    "my-server": {
      "url": "http://localhost:3000/api/mcp/mcp"
    }
  }
}
```

### Claude Desktop

macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "my-server": {
      "url": "http://localhost:3000/api/mcp/mcp"
    }
  }
}
```

## 测试命令

```bash
# 启动开发服务器
npm run dev

# 测试列表工具
curl -X POST http://localhost:3000/api/mcp/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'

# 测试调用工具
curl -X POST http://localhost:3000/api/mcp/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"my_tool","arguments":{"param1":"value"}}}'
```
