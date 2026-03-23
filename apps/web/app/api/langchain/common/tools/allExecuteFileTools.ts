import fs from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { spawn } from 'node:child_process';

// 项目根目录 - 支持通过环境变量配置
// 默认在 apps/web 运行时往上一级到 monorepo 根目录
const cwd = process.cwd();
console.log(`[readFileTool] process.cwd() = ${cwd}`);

let PROJECT_ROOT: string;
if (process.env.PROJECT_ROOT) {
  PROJECT_ROOT = process.env.PROJECT_ROOT;
} else if (cwd.includes('/apps/web')) {
  // apps/web 的上一级是 apps，再上一级才是 monorepo 根目录
  PROJECT_ROOT = path.resolve(cwd, '../..');
} else {
  PROJECT_ROOT = cwd;
}

console.log(`[readFileTool] PROJECT_ROOT = ${PROJECT_ROOT}`);

/**
 * @description 读取文件工具
 * @param filePath 文件路径
 * @returns 文件内容
 * @example
 * ```
 * const content = await readFileTool.invoke({ filePath: 'apps/web/package.json' });
 * console.log(content);
 * ```
 */
const readFileTool = tool(
  async ({ filePath }: { filePath: string }) => {
    // 如果是相对路径，则从项目根目录解析
    const resolvedPath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(PROJECT_ROOT, filePath);

    try {
      console.log(`[工具调用] read_file("${resolvedPath}") - 开始读取文件`);
      // 读取文件
      const content = await fs.readFile(resolvedPath, 'utf-8');
      console.log(
        `  [工具调用] read_file("${resolvedPath}") - 成功读取 ${content.length} 字节`,
      );
      return `文件内容:\n${content}`;
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'ENOENT') {
        return `错误: 文件不存在 - ${resolvedPath}`;
      }
      return `错误: ${err.message || 'Unknown error'}`;
    }
  },
  {
    name: 'read_file',
    description:
      '用此工具来读取文件内容。当用户要求读取文件、查看代码、分析文件内容时，调用此工具。输入文件路径（可以是相对路径或绝对路径）。',
    schema: z.object({
      filePath: z.string().describe('要读取的文件路径'),
    }),
  },
);

/**
 * @description 写文件工具
 * @param filePath 文件路径
 * @param content 文件内容
 * @returns 文件内容
 * @example
 * ```
 * const content = await writeFileTool.invoke({ filePath: 'apps/web/package.json', content: 'console.log("Hello, world!");' });
 * console.log(content);
 * ```
 */
const writeFileTool = tool(
  async ({ filePath, content }: { filePath: string; content: string }) => {
    // 如果是相对路径，则从项目根目录解析
    const resolvedPath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(PROJECT_ROOT, filePath);

    try {
      const dirPath = path.dirname(resolvedPath);
      // 如果目录不存在，则创建目录. recursive: true 表示如果目录不存在，则创建目录。如果目录存在，则不创建。
      await fs.mkdir(dirPath, { recursive: true });
      // 写入文件
      await fs.writeFile(resolvedPath, content);
      console.log(
        `  [工具调用] write_file("${resolvedPath}") - 成功写入 ${content.length} 字节`,
      );
      return `写入文件成功 - ${resolvedPath}`;
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      return `写入文件失败 - ${resolvedPath}: ${err.message || 'Unknown error'}`;
    }
  },
  {
    name: 'write_file',
    description:
      '用此工具来写入文件内容。当用户要求写入文件、创建文件、修改文件内容时，调用此工具。输入文件路径（可以是相对路径或绝对路径）和文件内容。',
    schema: z.object({
      filePath: z.string().describe('要写入的文件路径'),
      content: z.string().describe('要写入的文件内容'),
    }),
  },
);

/**
 * @description 执行命令工具
 * @param command 命令
 * @param workingDirectory 工作目录
 * @returns 命令输出
 * @example
 * ```
 * const output = await executeCommandTool.invoke({ command: 'ls -la' });
 * console.log(output);
 * ```
 */
const executeCommandTool = tool(
  async ({
    command,
    workingDirectory,
  }: {
    command: string;
    workingDirectory: string;
  }) => {
    // 如果是相对路径，则基于 PROJECT_ROOT 解析
    const cwd = path.isAbsolute(workingDirectory)
      ? workingDirectory
      : path.resolve(PROJECT_ROOT, workingDirectory);
    console.log(`[工具调用] execute_command("${command}") - 工作目录: ${cwd}`);

    return new Promise(resolve => {
      // 直接执行完整命令字符串，因为 shell: true 会自动处理引号、重定向等
      // 不再手动分割命令，避免处理复杂命令时出错
      const child = spawn(command, [], {
        cwd,
        stdio: 'inherit',
        shell: true,
      }) as unknown as NodeJS.Process;

      let errMsg = '';
      child.on('error', (error: Error) => {
        errMsg = error.message;
      });

      const cwdInfo = workingDirectory
        ? `\n\n重要提示：命令在目录 "${workingDirectory}" 中执行成功。如果需要在这个项目目录中继续执行命令，请使用 workingDirectory: "${workingDirectory}" 参数，不要使用 cd 命令。`
        : '';
      child.on('close', (code: number | null) => {
        if (code === 0) {
          console.log(`[工具调用] execute_command("${command}") - 命令执行成功`);

          resolve(`命令执行成功 - ${command}${cwdInfo}`);
        } else {
          console.error(
            `[工具调用] execute_command("${command}") - 命令执行失败: ${errMsg}`,
          );

          resolve(`命令执行失败，退出码: ${code}${errMsg ? '\n错误: ' + errMsg : ''}`);
        }
      });
    });
  },
  {
    name: 'execute_command',
    description:
      '用此工具来执行命令。当用户要求执行命令、运行脚本、执行系统命令时，调用此工具。输入命令和工作目录。',
    schema: z.object({
      command: z.string().describe('要执行的命令'),
      workingDirectory: z.string().describe('工作目录'),
    }),
  },
);

/**
 * @description 列出目录内容
 * @param directory 目录路径
 * @returns 目录内容
 * @example
 * ```
 * const content = await listDirectoryTool.invoke({ directory: 'apps/web' });
 * console.log(content);
 * ```
 */
const listDirectoryTool = tool(
  async ({ directory }: { directory: string }) => {
    // 如果是相对路径，则从项目根目录解析
    const resolvedPath = path.isAbsolute(directory)
      ? directory
      : path.resolve(PROJECT_ROOT, directory);

    try {
      // 列出目录内容
      console.log(`[工具调用] list_directory("${resolvedPath}") - 开始列出目录内容`);
      const files = await fs.readdir(resolvedPath);
      console.log(
        `[工具调用] list_directory("${resolvedPath}") - 目录内容: ${files.join(', ')}`,
      );
      return `目录内容: ${files.join(', ')}`;
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      return `错误: ${err.message || 'Unknown error'}`;
    }
  },
  {
    name: 'list_directory',
    description:
      '用此工具来列出目录内容。当用户要求列出目录内容、查看目录内容、查看文件列表时，调用此工具。输入目录路径（可以是相对路径或绝对路径）。',
    schema: z.object({
      directory: z.string().describe('要列出的目录路径'),
    }),
  },
);

export { readFileTool, writeFileTool, executeCommandTool, listDirectoryTool };
