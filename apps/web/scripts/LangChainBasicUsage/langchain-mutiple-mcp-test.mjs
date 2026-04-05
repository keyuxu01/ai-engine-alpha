/* eslint-disable no-undef */
import { loadEnvFiles } from '../../config/env.js';

loadEnvFiles();

import { MultiServerMCPClient } from '@langchain/mcp-adapters';
import { ChatOpenAI } from '@langchain/openai';
import chalk from 'chalk';
import { HumanMessage, ToolMessage } from '@langchain/core/messages';

/**
 * 创建 ChatOpenAI 模型实例
 *
 * 参数说明：
 * - modelName: 模型名称，使用通义千问 coder turbo
 * - apiKey: API 密钥，从环境变量 QWEN_LLM_API_KEY 获取
 * - temperature: 温度参数，设置为 0 表示最小随机性，让模型更确定性
 * - configuration: 额外配置
 *   - baseURL: API 基础URL，指向阿里云 DashScope
 */
const model = new ChatOpenAI({
  modelName: process.env.QWEN_CODER_PLUS_MODEL_NAME || 'qwen-coder-turbo',
  apiKey: process.env.QWEN_LLM_API_KEY,
  configuration: {
    baseURL: process.env.QWEN_CODER_TURBO_MODEL_BASE_URL,
  },
});

const mcpClient = new MultiServerMCPClient({
  mcpServers: {
    // 本地 MCP 服务器
    'my-mcp-server': {
      command: 'node',
      args: ['./scripts/LangChainBasicUsage/my-mcp-server.mjs'],
    },
    // 高德地图 MCP 服务器
    'amap-maps-streamableHTTP': {
      url: process.env.AMAP_MAPS_STREAMABLEHTTP_URL,
    },
    // MCP 官方文件系统服务器，文件读写、创建目录这种
    filesystem: {
      command: 'npx',
      args: [
        '-y',
        '@modelcontextprotocol/server-filesystem',
        ...(process.env.ALLOWED_FS_PATHS.split(',') || []),
      ],
    },
  },
});

/**
 * 获取工具列表
 *
 * 参数说明：
 * - mcpClient: MCP 客户端实例
 * - tools: 工具列表
 *
 */
const tools = await mcpClient.getTools();
console.log(`
    ${chalk.bgGreen('🔍 工具列表:')}
    ${tools.map(t => `${JSON.stringify(t)}`).join('\n')}
    `);
// 拿到其中的 tools 绑定给 model, 这样 model 就知道有哪些工具可以调用了
const modelWithTools = model.bindTools(tools);

// 模型执行工具调用
/**
 * 执行 Agent 工具调用, 如果有 tool_calls 就调用下，把工具调用结果封装为 ToolMessage 传给大模型继续处理。
 *
 * 参数说明：
 * - query: 查询语句
 * - maxIterations: 最大迭代次数(默认 30, 防止无限循环)
 */
async function runAgentWithTools(query, maxIterations = 30) {
  const messages = [new HumanMessage(query)];

  for (let i = 0; i < maxIterations; i++) {
    console.log(chalk.bgGreen(`⏳ 正在等待 AI 思考...`));
    const response = await modelWithTools.invoke(messages);
    messages.push(response);

    // 检查是否有工具调用
    if (!response.tool_calls || response.tool_calls.length === 0) {
      console.log(`\n✨ AI 最终回复:\n${response.content}\n`);
      return response.content;
    }

    console.log(chalk.bgBlue(`🔍 检测到 ${response.tool_calls.length} 个工具调用`));
    console.log(
      chalk.bgBlue(`🔍 工具调用: ${response.tool_calls.map(t => t.name).join(', ')}`),
    );
    // 执行工具调用
    for (const toolCall of response.tool_calls) {
      const foundTool = tools.find(t => t.name === toolCall.name);
      if (foundTool) {
        const toolResult = await foundTool.invoke(toolCall.args);

        // 确保 content 是字符串类型
        let contentStr;
        if (typeof toolResult === 'string') {
          contentStr = toolResult;
        } else if (toolResult && toolResult.text) {
          // 如果返回对象有 text 字段，优先使用
          contentStr = toolResult.text;
        }

        messages.push(
          new ToolMessage({
            content: contentStr,
            tool_call_id: toolCall.id,
          }),
        );
      }
    }
  }

  return messages[messages.length - 1].content;
}

// await runAgentWithTools('常州北站到同济花园的路线');
await runAgentWithTools(
  '常州北站到同济花园的路线，生成一个文档，保存到 /Users/temptrip/Desktop/Project/mcp/ai-engine-alpha/apps/web/scripts/LangChainBasicUsage/generated/routeChangzhouToTongjiGarden.md 文件',
);
await runAgentWithTools(
  '从草场门到集庆门大街的路线，生成一个文档，保存到 /Users/temptrip/Desktop/Project/mcp/ai-engine-alpha/apps/web/scripts/LangChainBasicUsage/generated/routeCaochangmenToJiqimenDajie.md 文件',
);

await mcpClient.close();
