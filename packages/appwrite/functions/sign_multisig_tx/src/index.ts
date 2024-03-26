import { Client, Databases } from 'https://deno.land/x/appwrite@7.0.0/mod.ts';
import { Multisig, RequestBody, Signature, MultisigTx } from './types.ts';
import { fromBase64 } from "npm:@cosmjs/encoding";
import { makeMultisignedTxBytes, SigningStargateClient } from "npm:@cosmjs/stargate";
import { createMultisigThresholdPubkey } from 'npm:@cosmjs/amino';

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
export default async ({ req, res, error }: Context) => {

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

    const { id, password, multisig_id, rpc, fee, prefix, signature } = JSON.parse(req.bodyRaw) as RequestBody;

    if (!id) {
      throw new Error("id is required in body");
    }
    if (!password) {
      throw new Error("password is required in body");
    }
    if (!multisig_id) {
      throw new Error("multisig_id is required in body");
    }
    if (!rpc) {
      throw new Error("rpc is required in body");
    }
    if (!fee) {
      throw new Error("fee is required in body");
    }
    if (!prefix) {
      throw new Error("prefix is required in body");
    }
    if (!signature) {
      throw new Error("signature is required in body");
    }

    const client = new Client()
      .setEndpoint(appwrite_url)
      .setProject(project_id)
      .setKey(appwriteKey);
    
    const database = new Databases(client);

    // Find the transaction
    const document = await database.getDocument("multisig", "transactions", id);
    const tx = document as unknown as MultisigTx;

    // Check that the user who is adding the signature is a member of the multisig
    const member = tx.multisigs.members.find((m) => JSON.parse(m) === signature.pub_key);
    if (!member) {
      throw new Error("This user is not a member of the multisig");
    }

    // Get the multisig info
    const doc = await database.getDocument("multisig", "multisigs", multisig_id);
    const multisig = doc as unknown as Multisig;

    // If we have met the threshold then we can construct & broadcast the tx
    if ((tx.signatures.length+1) === multisig.threshold) {

      // So we have to map through the signatures and turn them into byte arrays
      const signatures: Signature[] = [];
      const sigs = new Map(signatures.map((s) => {
        return [s.address, fromBase64(s.signature)]
      }))

      const multiSigPubKey = createMultisigThresholdPubkey(multisig.members.map(mem => JSON.parse(mem)), Number(multisig.threshold));
  
      const cosmClient = await SigningStargateClient.connect(rpc);

      const signedTxBytes = makeMultisignedTxBytes(
        multiSigPubKey,
        tx.sequence,
        fee,
        fromBase64(tx.body_bytes),
        sigs,
      );

      // Broadcast tx
      const result = await cosmClient.broadcastTx(signedTxBytes);

      // Delete the multisig tx from the database if successful
      if (result.code === 0) {
        await database.deleteDocument("multisig", "transactions", id);
      }

      // If not successful we just return the result
      return res.json({
        data: result,
        success: false
      });
    }

    // If we have not met the threshold then we update the document with the new signature
    const response = await database.updateDocument("multisig", "transactions", id, {
      signatures: [...tx.signatures, JSON.stringify(signature)]
    });

    return res.json({
      data: response,
      success: true
    });

  } catch (e) {

    error(e);
    throw e;

  }

};