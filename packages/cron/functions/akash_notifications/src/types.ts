export enum Status {
  ACTIVE = "active",
  OPEN = "open",
  CLOSED = "closed",
  PAUSED = "paused",
  OVERDRAWN = "overdrawn",
  INSUFFIENCT = "insufficient_funds",
  INVALID = "invalid",
}

export interface AKASH_LEASE {
  lease_id: string;
  state: Status;
  address: string;
}

export interface AKASH_NOTIFICATION {
  read: boolean;
  address: string;
  lease: string;
  notification: string;
  timestamp: number;
  type: Status;
}

export interface DB_NOTIFICATION_RETURN {
  total: number;
  documents: AKASH_NOTIFICATION[];
}

export interface DB_LEASE_RETURN {
  total: number;
  documents: AKASH_LEASE[];
}

export const RESOURCE = "akash";
export const OPEN_LEASE_COLLECTION_NAME = "open_leases";
export const NOTIFICATIONS_COLLECTION_NAME = "notifications";

export const apiUrl = Deno.env.get("AKASH_API_URL");
if (!apiUrl) {
  throw new Error("The environment variable AKASH_API_URL is not set.");
}

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