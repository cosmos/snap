import { postNotification } from './post.ts';
import { getNotifications } from './get.ts';
import { Client, Databases } from 'https://deno.land/x/appwrite@7.0.0/mod.ts';

const apiUrl = Deno.env.get("AKASH_API_URL");
if (!apiUrl) {
  throw new Error("The environment variable AKASH_API_URL is not set.");
}

const appwriteKey = Deno.env.get("APPWRITE_KEY");
if (!appwriteKey) {
  throw new Error("The environment variable APPWRITE_KEY is not set.");
}
const appwrite_url = Deno.env.get("APPWRITE_URL");
if (!appwrite_url) {
  throw new Error("APPWRITE_URL is not defined");
}
const project_id = Deno.env.get("APPWRITE_FUNCTION_PROJECT_ID");
if (!project_id) {
  throw new Error("APPWRITE_FUNCTION_PROJECT_ID is not defined");
}

export const client = new Client()
  .setEndpoint(appwrite_url)
  .setProject(project_id)
  .setKey(appwriteKey);

export const db = new Databases(client);

// deno-lint-ignore no-explicit-any
export async function main(context: any) {
  try {
    switch (context.req.method) {
      case "GET":
        await getNotifications(context);
      // deno-lint-ignore no-fallthrough
      case "POST":
        await postNotification(context);
      default:
        context.error(`Invalid HTTP method ${context.req.method}`);
        throw new Error("Invalid HTTP method");
    }
  } catch (error) {
    context.error(error);
    return context.res.json({
      error: error.message,
      success: false
    }, 500);
  }
}