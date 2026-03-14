import 'dotenv/config';
import { NextRequest, NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage, ToolMessage } from '@langchain/core/messages';
/**
 * InMemoryChatMessageHistory - LangChain 提供的内存消息历史管理类
 * 用于在内存中存储和管理对话消息，支持添加消息和获取消息历史
 */
import { InMemoryChatMessageHistory } from '@langchain/core/chat_history';

import {
  readFileTool,
  writeFileTool,
  executeCommandTool,
  listDirectoryTool,
} from './tools';

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
  modelName: process.env.QWEN_CODER_TURBO_MODEL_NAME || 'qwen-coder-turbo',
  apiKey: process.env.QWEN_LLM_API_KEY,
  temperature: 0,
  configuration: {
    baseURL: process.env.QWEN_CODER_TURBO_MODEL_BASE_URL,
  },
});

/**
 * 定义可用工具列表
 *
 * LangChain Agent 可以使用这些工具来完成任务：
 * - readFileTool: 读取文件内容
 * - writeFileTool: 写入文件内容
 * - executeCommandTool: 执行系统命令
 * - listDirectoryTool: 列出目录内容
 */
const tools = [readFileTool, writeFileTool, executeCommandTool, listDirectoryTool];

/**
 * 将工具绑定到模型
 *
 * bindTools 是 LangChain 的核心方法之一
 * 它会：
 * 1. 将工具定义传递给模型，让模型知道有哪些工具可用
 * 2. 修改模型的输出格式，当模型需要调用工具时，会返回 structured output 而不是普通文本
 * 3. 返回一个新的 Runnable，可以像调用普通模型一样调用，但会自动处理工具调用
 */
const modelWithTools = model.bindTools(tools);

/**
 * POST 请求处理函数 - AI Agent API 端点
 *
 * 工作流程：
 * 1. 解析请求体，获取用户消息和参数
 * 2. 初始化消息历史（使用 InMemoryChatMessageHistory）
 * 3. 添加系统消息（定义 Agent 角色和行为规则）
 * 4. 添加用户消息
 * 5. 进入 Agent 循环：
 *    a. 调用模型，获取响应
 *    b. 检查响应是否包含工具调用
 *    c. 如果没有工具调用，返回最终结果
 *    d. 如果有工具调用，执行工具并将结果添加到历史，然后继续循环
 * 6. 如果达到最大迭代次数仍未完成，返回当前结果
 *
 * @param req - Next.js 请求对象
 * @returns JSON 响应，包含 AI 回复和消息历史
 */
export async function POST(req: NextRequest) {
  try {
    // 1. 解析请求体
    const body = await req.json();
    const {
      humanMessage, // 用户消息，必填
      maxIterations = 30, // 最大迭代次数，默认30次，防止无限循环
    } = body;

    console.log('humanMessage:', humanMessage);
    console.log('maxIterations:', maxIterations);

    // 2. 使用 InMemoryChatMessageHistory 管理消息历史
    // 相比手动管理数组，InMemoryChatMessageHistory 提供了更方便的 API
    const history = new InMemoryChatMessageHistory();

    // 3. 添加系统消息
    // 系统消息定义了 Agent 的角色、能力和行为规则
    await history.addMessage(
      new SystemMessage(`你是一个项目管理助手，使用工具完成任务。

当前工作目录: ${process.cwd()}

工具列表: ${tools.map(t => t.name).join(', ')}

工具使用方法:
- read_file: 读取文件内容
- write_file: 写入文件内容
- execute_command: 执行命令
- list_directory: 列出目录内容

重要规则 - execute_command：
- workingDirectory 参数会自动切换到指定目录
- 当使用 workingDirectory 时，绝对不要在 command 中使用 cd
- 错误示例: { command: "cd react-todo-app && pnpm install", workingDirectory: "react-todo-app" }
- 正确示例: { command: "pnpm install", workingDirectory: "react-todo-app" }

重要规则 - write_file：
- 当写入 React 组件文件（如 App.tsx）时，如果存在对应的 CSS 文件（如 App.css），在其他 import 语句后加上这个 css 的导入

回复要简洁，只说做了什么`),
    );

    // 4. 添加用户消息
    await history.addMessage(new HumanMessage(humanMessage));

    // 5. Agent 循环
    // 这个循环实现了 ReAct (Reasoning + Acting) 模式
    // 模型会反复思考和执行工具，直到任务完成
    for (let i = 0; i < maxIterations; i++) {
      console.log(`\n[第 ${i + 1} 次迭代]`);

      // 5a. 获取当前消息历史并调用模型
      // 注意：每次循环都会传入完整的历史，包括之前的工具调用和结果
      // 这样模型可以根据上下文决定下一步行动
      const messages = await history.getMessages();
      const response = await modelWithTools.invoke(messages);

      console.log('response:', JSON.stringify(response));

      // 打印响应详情，帮助调试
      console.log('[响应类型]', response.getType());
      console.log('[tool_calls]', response.tool_calls);
      console.log('[content 前100字符]', String(response.content).slice(0, 100));

      // 5b. 将 AI 响应添加到消息历史
      // 这一步很重要，因为下一轮循环需要知道模型说了什么
      await history.addMessage(response);

      // 5c. 检查是否有工具调用
      // tool_calls 是 bindTools 创建的 StructuredOutput 格式
      // 如果模型决定调用工具，会在这里返回工具调用信息
      if (!response.tool_calls || response.tool_calls.length === 0) {
        // 没有工具调用，说明模型已经生成了最终回复
        console.log(`\n[最终回复] ${response.content}`);

        // 返回成功响应
        return NextResponse.json({
          success: true,
          response: response.content,
          // 同时返回消息历史，客户端可以保存用于多轮对话
          messages: (await history.getMessages()).map(msg => ({
            type: msg.getType(),
            content: msg.content,
          })),
        });
      }

      // 5d. 执行工具调用
      // 遍历模型返回的所有工具调用，依次执行
      for (const toolCall of response.tool_calls) {
        // 查找对应的工具
        const foundTool = tools.find(t => t.name === toolCall.name);

        if (foundTool) {
          console.log(`  [执行工具] ${toolCall.name}(${JSON.stringify(toolCall.args)})`);

          // 调用工具并获取结果
          // 使用类型断言绕过 LangChain 工具类型推断问题
          // 因为 tools 数组有多个不同类型的工具，TypeScript 无法正确推断
          const toolResult = await (
            foundTool as unknown as {
              invoke(args: Record<string, unknown>): Promise<string>;
            }
          ).invoke(toolCall.args as Record<string, unknown>);

          // 将工具执行结果添加到消息历史
          // ToolMessage 必须包含 tool_call_id 来关联到对应的工具调用
          await history.addMessage(
            new ToolMessage({
              content: toolResult,
              tool_call_id: toolCall.id || 'unknown',
            }),
          );
        }
      }

      // 循环会自动继续，下一轮模型会根据工具结果决定下一步
    }

    // 6. 达到最大迭代次数
    // 如果循环结束还没有返回，说明达到了最大迭代次数
    const finalMessages = await history.getMessages();
    const lastMessage = finalMessages[finalMessages.length - 1];
    const finalResponse = lastMessage ? String(lastMessage.content) : '';

    return NextResponse.json({
      success: true,
      response: finalResponse,
      messages: finalMessages.map(msg => ({
        type: msg.getType(),
        content: msg.content,
      })),
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
