/* eslint-disable no-undef */
import { loadEnvFiles } from '../../config/env.js';

loadEnvFiles();

import { MultiServerMCPClient } from '@langchain/mcp-adapters';
import { ChatOpenAI } from '@langchain/openai';
import chalk from 'chalk';
import { HumanMessage, SystemMessage, ToolMessage } from '@langchain/core/messages';

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

/**
 * 创建 MCP 客户端实例
 *
 * 参数说明：
 * - mcpServers: MCP 服务器列表
 *   - 'my-mcp-server': MCP 服务器配置
 *     - command: 执行命令，使用 node 命令
 *     - args: 执行参数，指向 MCP 服务器脚本路径
 */
const mcpClient = new MultiServerMCPClient({
  mcpServers: {
    'my-mcp-server': {
      command: 'node',
      args: [
        '/Users/temptrip/Desktop/Project/mcp/ai-engine-alpha/apps/web/scripts/LangChainBasicUsage/my-mcp-server.mjs',
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
 */
const tools = await mcpClient.getTools();
console.log(`
    ${chalk.bgGreen('🔍 工具列表:')}
    ${tools.map(t => `${JSON.stringify(t)}`).join('\n')}
    `);
const modelWithTools = model.bindTools(tools);

const resourcesList = await mcpClient.listResources();

let resourceContent = '';
for (const [serverName, resources] of Object.entries(resourcesList)) {
  console.log(`
    ${chalk.bgGreen('🔍 资源列表:')}
    ${serverName}: 
        ${resources.map(r => JSON.stringify(r, null, 2)).join('\n')}
    `);
  for (const resource of resources) {
    const content = await mcpClient.readResource(serverName, resource.uri);
    console.log(`
        ${chalk.bgGreen('🔍 资源内容:')}
        ${content[0].text}
        `);
    resourceContent += content[0].text;
  }
}

console.log(`
    ${chalk.bgGreen('🔍 资源内容:')}
    ${resourceContent}
    `);

async function runAgentWithTools(query, maxIterations = 30) {
  const messages = [new SystemMessage(resourceContent), new HumanMessage(query)];

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
        messages.push(
          new ToolMessage({
            content: toolResult,
            tool_call_id: toolCall.id,
          }),
        );
      }
    }
  }

  return messages[messages.length - 1].content;
}

await runAgentWithTools('查一下用户 002 的信息');
// await runAgentWithTools("MCP Server 的使用指南是什么");

await mcpClient.close();
