import { Client, Databases } from "https://deno.land/x/appwrite@10.0.0/mod.ts";
import { MultisigTx } from "../../sign_multisig_tx/src/types.ts";

export interface Multisig {
  threshold: number;
  members: string[];
  name: string;
  akash_address: string;
  transactions: MultisigTx[];
  public_key: string;
}

export const RESOURCE = "multisig";
export const MULTISIG_COLLECTION_NAME = "multisig";
export const TRANSACTIONS_COLLECTION_NAME = "transactions";

export const appwriteKey = Deno.env.get("APPWRITE_KEY");
if (!appwriteKey) {
  throw new Error("The environment variable APPWRITE_KEY is not set.");
}
export const appwrite_url = Deno.env.get("APPWRITE_URL");
if (!appwrite_url) {
  throw new Error("APPWRITE_URL is not defined");
}
export const project_id = Deno.env.get("APPWRITE_FUNCTION_PROJECT_ID");
if (!project_id) {
  throw new Error("APPWRITE_FUNCTION_PROJECT_ID is not defined");
}

export const client = new Client()
  .setEndpoint(appwrite_url)
  .setProject(project_id)
  .setKey(appwriteKey);

export const db = new Databases(client);

export interface RequestBody {
  address: string;
};

export interface DB_MULTISIG_RETURN {
  total: number;
  documents: Multisig[];
}