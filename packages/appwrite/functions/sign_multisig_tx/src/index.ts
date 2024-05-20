import { Client, Databases, Query } from 'https://deno.land/x/appwrite@10.0.0/mod.ts';
import { Multisig, RequestBody, Signature, DB_TX_RETURN, RESOURCE, MULTISIG_COLLECTION_NAME } from './types.ts';
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

    const { public_key, rpc, fee, prefix, signature, signer_address } = JSON.parse(req.bodyRaw) as RequestBody;

    if (!public_key) {
      throw new Error("public_key is required in body");
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
    if (!signer_address) {
      throw new Error("signer_address is required in body");
    }

    const client = new Client()
      .setEndpoint(appwrite_url)
      .setProject(project_id)
      .setKey(appwriteKey);
    
    const database = new Databases(client);

    const cosmClient = await SigningStargateClient.connect(rpc);

    // Get the multisig info
    const multisigReturn: DB_TX_RETURN = await database.listDocuments(
      RESOURCE,
      MULTISIG_COLLECTION_NAME,
      [
        Query.equal("public_key", public_key),
      ],
    ) as unknown as DB_TX_RETURN;
    if (multisigReturn.total === 0) {
      throw new Error("No multisig found for this address");
    }
    const multisig = multisigReturn.documents[0] as unknown as Multisig;

    // get the multisig tx from the multisig
    const tx = multisig.transactions[0];

    const account = await cosmClient.getAccount(signer_address);
    if (!account) {
      throw new Error(`Account with address ${signer_address} not found. Create a transaction with this account to create it.`);
    }
    if (!account.pubkey) {
      throw new Error(`Public key for address ${signer_address} not found. Create a transaction with this account to create it.`);
    }

    // Check if this signer already signed the tx
    const signed = tx.signatures.find((s) => JSON.parse(s).pub_key === account.pubkey);
    if (signed) {
      return res.json({
        data: "This user has already signed this transaction.",
        success: false,
        statusCode: 400
      });
    }

    // Check that the user who is adding the signature is a member of the multisig
    const member = tx.multisigs.members.find((m) => JSON.parse(m) === account.pubkey);
    if (!member) {
      throw new Error("This user is not a member of the multisig");
    }

    // If we have met the threshold then we can construct the full multisig tx and return it
    if ((tx.signatures.length+1) === multisig.threshold) {

      // So we have to map through the signatures and parse them from json strings
      const signatures: Signature[] = tx.signatures.map((s) => JSON.parse(s));
      signatures.push(
        {
          address: signer_address,
          signature: signature
        }
      )
      const sigs = new Map(signatures.map((s) => {
        return [s.address, fromBase64(s.signature)]
      }))

      const multiSigPubKey = createMultisigThresholdPubkey(multisig.members.map(mem => JSON.parse(mem)), Number(multisig.threshold));

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
        await database.deleteDocument("multisig", "transactions", tx.tx_id);
        return res.json({
          data: result,
          success: false,
          statusCode: 201
        });
      }

      // If not successful we just return the result as 500 server error
      return res.json({
        data: result,
        success: false,
        statusCode: 500
      });
    }

    const sig = { address: signer_address, signature };

    // If we have not met the threshold then we update the document with the new signature
    const response = await database.updateDocument("multisig", "transactions", tx.tx_id, {
      signatures: tx.signatures.push(JSON.stringify(sig))
    });

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