import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';

export interface Multisig {
  threshold: number;
  members: string[];
  name: string;
  public_key: string;
  akash_address: string;
  transactions: any[];
  $id: string;
}

export const appwrite_url = env.PUBLIC_APPWRITE_URL;
export const project_id = env.PUBLIC_APPWRITE_FUNCTION_PROJECT_ID;
if (browser) {
  if (!appwrite_url) {
    throw new Error("PUBLIC_APPWRITE_URL is not defined");
  }
  if (!project_id) {
    throw new Error("PUBLIC_APPWRITE_FUNCTION_PROJECT_ID is not defined");
  }
}