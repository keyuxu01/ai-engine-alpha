/* eslint-env node */

import { loadEnvFiles } from './config/env.js';

const appEnv = loadEnvFiles();

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    APP_ENV: appEnv,
  },
};

export default nextConfig;
