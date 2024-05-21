import { Client, Databases } from 'https://deno.land/x/appwrite@10.0.0/mod.ts';
import { RequestBody } from './types.ts';
type Context = {
  // deno-lint-ignore no-explicit-any
  req: any;
  // deno-lint-ignore no-explicit-any
  res: any;
  // deno-lint-ignore no-explicit-any
  log: (msg: any) => void;
  // deno-lint-ignore no-explicit-any
  error: (msg: any) => void;
};
export default async ({ req, res, log, error }: Context) => {

  try {

    if (req.method != "POST") {
      throw new Error(`Invalid request method: ${req.method}`);
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

    const { tx_id } = JSON.parse(req.bodyRaw) as RequestBody;

    if (!tx_id) {
      throw new Error("tx_id is required in body");
    }

    log(`Deleting the multisig transaction ${tx_id}`);

    const client = new Client()
      .setEndpoint(appwrite_url)
      .setProject(project_id)
      .setKey(appwriteKey);
    
    const database = new Databases(client);

    const response = await database.deleteDocument("multisig", "transactions", tx_id);

    return res.json({
      data: response,
      success: true,
      statusCode: 201
    });

  } catch (e) {

    error(e);

    return res.json({
      data: e.message,
      success: false,
      statusCode: 500
    });

  }

};