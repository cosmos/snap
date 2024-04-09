import type { SnapConfig } from '@metamask/snaps-cli';
import { resolve } from 'path';

const config: SnapConfig = {
  input: resolve(__dirname, 'src/index.ts'),
  server: {
    port: 8028,
  },
  stats: {
    buffer: false,
  },
  environment: {
    DENO_SERVERLESS_URL: process.env.DENO_SERVERLESS_URL,
    APPWRITE_URL: process.env.APPWRITE_URL,
    APPWRITE_FUNCTION_PROJECT_ID: process.env.APPWRITE_FUNCTION_PROJECT_ID,
  },
};

export default config;