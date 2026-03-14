import fs from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { tool } from '@langchain/core/tools';

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

export { readFileTool };
