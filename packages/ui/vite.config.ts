import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit()],
  define: {
    'process.env.VITE_DENO_SERVERLESS_URL': JSON.stringify(process.env.VITE_DENO_SERVERLESS_URL),
    'process.env.VITE_APPWRITE_URL': JSON.stringify(process.env.VITE_APPWRITE_URL),
    'process.env.VITE_APPWRITE_FUNCTION_PROJECT_ID': JSON.stringify(process.env.VITE_APPWRITE_FUNCTION_PROJECT_ID),
    'process.env.VITE_SNAP_ID': JSON.stringify(process.env.VITE_SNAP_ID),
    'process.env.VITE_SNAP_VERSION': JSON.stringify(process.env.VITE_SNAP_VERSION),
    'process.env.VITE_NUMIA_API_KEY': JSON.stringify(process.env.VITE_NUMIA_API_KEY),
  }
});
