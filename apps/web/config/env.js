/* eslint-env node */
// https://juejin.cn/post/6993224664705138702
import path from 'node:path';
import process from 'node:process';
import { config as dotenvConfig } from 'dotenv';

/**
 * 加载环境变量
 * 优先级：先加载 .env，再加载 .env.APP_ENV（后者覆盖前者）
 */
export function loadEnvFiles() {
  const appEnv = process.env.APP_ENV || 'dev';
  const envFiles = [path.resolve(process.cwd(), '.env')];

  if (appEnv) {
    envFiles.push(path.resolve(process.cwd(), `.env.${appEnv}`));
  }

  console.log(`[env] Loading env files: ${envFiles.join(', ')}`);

  for (const envFile of envFiles) {
    try {
      dotenvConfig({ path: envFile, override: true });
    } catch {
      // 忽略文件不存在的错误
    }
  }

  return appEnv;
}

/**
 * 获取当前应用环境
 */
export function getAppEnv() {
  return process.env.APP_ENV || 'dev';
}
