import { spawn } from 'node:child_process';
import process from 'node:process';

// ls -la 命令，列出当前目录下的所有文件和目录
const command = 'ls -la';
// cwd 是当前工作目录
const cwd = process.cwd();

// 将命令拆分成 cmd 和 args（使用 rest 参数确保 args 是数组）
const [cmd, ...args] = command.split(' ');

/**
 * @description spawn 可以在指定目录下执行命令。会创建一个子进程来执行命令。
 * spawn 和 redux saga 的 spawn 类似，都是创建一个子进程来执行命令。(
 * 区别：spawn 是 node:child_process 模块的 spawn 函数，而 redux saga 的 spawn 是 redux saga 的 spawn 函数
 * 复习下 redux saga 的 spawn 函数：
 * ```
 * const saga = yield spawn(function*() {
 *   yield takeEvery('FETCH_DATA', fetchData);
 * });
 * ```
 * spawn 在 redux saga 中用于创建一个（独立于父任务）子任务，用于执行命令。
 * 和 action 中的 fork 类似都是非阻塞的。
 * 区别：spawn 父任务被取消时，子任务不会被自动取消，错误不会传播到父任务，用于创建独立运行的后台任务。
 * fork 父任务被取消时，子任务会被自动取消，错误会冒泡到父任务，用于创建一个独立的任务，用于执行命令。
 * )
 */
const child = spawn(cmd, args, {
  cwd, // 当前工作目录
  stdio: 'inherit', // 就是这个子进程的 stdout 也输出到父进程的 stdout
  shell: true, // 使用 shell 执行命令
});

let errMsg = '';

child.on('error', error => {
  errMsg = error.message;
});

child.on('close', code => {
  if (code === 0) {
    process.exit(0);
  } else {
    if (errMsg) {
      console.error(errMsg);
    } else {
      console.error(`Command failed with exit code ${code}`);
    }
    process.exit(1);
  }
});
