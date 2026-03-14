import 'dotenv/config';
import { NextRequest, NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';
import {
  HumanMessage,
  SystemMessage,
  ToolMessage,
  type MessageType,
} from '@langchain/core/messages';
import type { BaseMessage } from '@langchain/core/messages';

import { readFileTool } from './tools';

/**
 * ChatOpenAI 这个类是 LangChain 提供的，用来创建一个模型。这个模型是 OpenAI 的模型。
 * 参数：
 * - modelName: 模型名称
 * - apiKey: 模型 API 密钥
 * - temperature: 温度，也就是 ai 的创造性，设置为 0，让它严格按照指令来做事情，不要自己发挥
 * - configuration: 配置，用于配置模型的基本信息
 */
const model = new ChatOpenAI({
  modelName: process.env.QWEN_CODER_TURBO_MODEL_NAME || 'qwen-coder-turbo',
  apiKey: process.env.QWEN_LLM_API_KEY,
  temperature: 0,
  configuration: {
    baseURL: process.env.QWEN_CODER_TURBO_MODEL_BASE_URL,
  },
});

// 使用工具列表
const tools = [readFileTool];

// 将模型和工具绑定在一起，这样模型可以调用工具
const modelWithTools = model.bindTools(tools);

/**
 * POST 请求处理函数
 *
 * 问题 1: 每次 POST messages 会不会丢失？
 * - 当前实现：每个请求都是独立的，messages 不会保留
 * - 解决方案：支持从客户端传入 messages，实现多轮对话
 *
 * @param req - Next.js 请求对象
 * @returns JSON 响应
 */
export async function POST(req: NextRequest) {
  try {
    // 解析请求体
    const body = await req.json();
    const {
      messages: clientMessages, // 客户端传入的消息历史（用于多轮对话）
      filePath: filePathParam, // 要读取的文件路径
      humanMessage, // 用户消息
    } = body;

    // 默认读取当前文件
    const filePath = filePathParam || 'apps/web/app/demo-langchain/route.ts';

    console.log('clientMessages', clientMessages);
    console.log('filePath', filePath);
    console.log('humanMessage', humanMessage);
    // 构建消息列表
    // 如果客户端传入 messages，则使用客户端的消息；否则创建新的对话
    const messages: BaseMessage[] = clientMessages
      ? clientMessages.map((msg: { type: MessageType; content: string }) => {
          // 根据消息类型创建对应的消息对象
          switch (msg.type) {
            case 'system':
              return new SystemMessage(msg.content);
            case 'human':
              return new HumanMessage(msg.content);
            case 'ai':
              return new HumanMessage(msg.content); // 简化处理
            default:
              return new HumanMessage(msg.content);
          }
        })
      : [
          // 首次对话：创建系统消息和用户消息
          new SystemMessage(`你是一个代码助手，可以使用工具读取文件并解释代码。

工作流程：
1. 用户要求读取文件时，立即调用 read_file 工具，传入用户提供的文件路径
2. 等待工具返回文件内容
3. 基于文件内容进行分析和解释

可用工具：
- read_file: 读取文件内容（使用此工具来获取文件内容）
`),
          new HumanMessage(
            humanMessage
              ? `${humanMessage}\n\n文件路径：${filePath}`
              : `请读取 ${filePath} 文件内容并解释代码`,
          ),
        ];

    // 第一次模型调用
    let response = await modelWithTools.invoke(messages);

    // 循环处理工具调用（Agent 模式）
    // 模型可能返回 tool_calls，需要执行工具并返回结果，然后再次调用模型
    while (response.tool_calls && response.tool_calls.length > 0) {
      console.log(`\n[检测到 ${response.tool_calls.length} 个工具调用]`);

      // 将模型响应（AIMessage）添加到消息历史
      messages.push(response as unknown as BaseMessage);

      // 并行执行所有工具调用
      const toolResults = await Promise.all(
        response.tool_calls.map(async toolCall => {
          // 查找对应的工具
          const tool = tools.find(t => t.name === toolCall.name);
          if (!tool) {
            return `错误: 找不到工具 ${toolCall.name}`;
          }

          console.log(`  [执行工具] ${toolCall.name}(${JSON.stringify(toolCall.args)})`);

          try {
            // 调用工具并返回结果
            const result = await tool.invoke(toolCall.args as { filePath: string });
            return result;
          } catch (error) {
            return `错误: ${error instanceof Error ? error.message : 'Unknown error'}`;
          }
        }),
      );

      // 将工具结果添加到消息历史
      // 注意：tool_call_id 必须提供，用于关联工具调用和结果
      response.tool_calls.forEach((toolCall, index) => {
        messages.push(
          new ToolMessage({
            content: toolResults[index] as string,
            tool_call_id: toolCall.id || `call_${index}`,
          }),
        );
      });

      // 再次调用模型，传入所有历史消息和工具结果
      // 模型会根据工具结果生成最终回复
      response = await modelWithTools.invoke(messages);
    }

    console.log('\n[最终回复]');
    console.log(response.content);

    // 返回结果
    return NextResponse.json({
      success: true,
      response: response.toJSON(),
      // 返回更新后的消息历史，客户端可以保存用于后续对话
      messages: messages.map(msg => ({
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
