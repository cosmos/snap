import { Client, Databases, ID } from 'https://deno.land/x/appwrite@7.0.0/mod.ts';
import { createMultisigThresholdPubkey, pubkeyToAddress } from 'npm:@cosmjs/amino';
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
    if (!Deno.env.get("APPWRITE_FUNCTION_PROJECT_ID")) {
      throw new Error("APPWRITE_FUNCTION_PROJECT_ID is not defined");
    }
    const project_id = Deno.env.get("APPWRITE_FUNCTION_PROJECT_ID");
    if (!Deno.env.get("APPWRITE_API_KEY")) {
      throw new Error("APPWRITE_API_KEY is not defined");
    }
    const api_key_appwrite = Deno.env.get("APPWRITE_API_KEY");

    const { name, threshold, pubKeys } = JSON.parse(req.bodyRaw) as RequestBody;

    if(!name) {
      throw new Error("name is required in body");
    }
    if(!threshold) {
      throw new Error("threshold is required in body");
    }
    if(!pubKeys) {
      throw new Error("pubKeys is required in body");
    }

    log(`Creating Multisig named ${name} and with threshold ${threshold}`);

    const client = new Client()
      .setEndpoint('https://cloud.appwrite.io/v1')
      .setProject(project_id!)
      .setKey(api_key_appwrite!);
    
    const database = new Databases(client);

    // Create a multisig account/address
    const multiSigPubKey = createMultisigThresholdPubkey(pubKeys, Number(threshold));

    const address = pubkeyToAddress(multiSigPubKey, "akash");

    // Add the multisig into the database.
    const response = await database.createDocument("multisig", "multisigs", ID.unique(), {
      name: name,
      threshold: threshold,
      members: pubKeys.map((pubKey) => JSON.stringify(pubKey)),
      pubkey: multiSigPubKey
    });

    log(`Added Multisig ${address} to database. (${JSON.stringify(response)})`)

    return res.json({
      data: response,
      success: true
    });

  } catch (e) {

    error(e);
    throw e;

  }

};