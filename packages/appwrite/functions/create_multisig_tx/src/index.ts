import { Client, Databases, ID, Permission, Query, Role } from 'https://deno.land/x/appwrite@10.0.0/mod.ts';
import { DB_TX_RETURN, MULTISIG_COLLECTION_NAME, Multisig, RESOURCE, RequestBody } from './types.ts';
import { pubkeyToAddress } from 'npm:@cosmjs/launchpad';
import { fromBase64 } from "npm:@cosmjs/encoding";
import { makeMultisignedTxBytes, StargateClient } from "npm:@cosmjs/stargate";
import { createMultisigThresholdPubkey } from 'npm:@cosmjs/amino';
import type { EncodeObject } from 'npm:@cosmjs/proto-signing';

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

    const { public_key, rpc, prefix, signature, body_bytes, messages, chain_id, signer_address, fee } = JSON.parse(req.bodyRaw) as RequestBody;

    if (!public_key) {
      throw new Error("public_key is required in body");
    }
    if (!rpc) {
      throw new Error("rpc is required in body");
    }
    if (!prefix) {
      throw new Error("prefix is required in body");
    }
    if (!signature) {
      throw new Error("signature is required in body");
    }
    if (!body_bytes) {
      throw new Error("body_bytes is required in body");
    }
    if (!messages) {
      throw new Error("messages is required in body");
    }
    if (!chain_id) {
      throw new Error("chain_id is required in body");
    }
    if (!signer_address) {
      throw new Error("signer_address is required in body");
    }
    if (!fee) {
      throw new Error("fee is required in body");
    }

    const client = new Client()
      .setEndpoint(appwrite_url)
      .setProject(project_id)
      .setKey(appwriteKey);
    
    const database = new Databases(client);

    // Get the multisig info
    const multisigReturn: DB_TX_RETURN = await database.listDocuments(
      RESOURCE,
      MULTISIG_COLLECTION_NAME,
      [
        Query.equal("public_key", JSON.stringify(public_key)),
      ],
    ) as unknown as DB_TX_RETURN;
    if (multisigReturn.total === 0) {
      throw new Error("No multisig found for this address");
    }
    const multisig = multisigReturn.documents[0] as unknown as Multisig;

    // Check if there is a pending tx for the multisig wallet and if so direct the user to sign it before creating a new one
    const pendingTx = multisig.transactions[0];
    if (pendingTx) {
      throw new Error(`There is a pending transaction for the multisig wallet with the name ${multisig.name}. Please have multisig members sign and submit this tx first before creating a new one.`);
    }

    const cosmClient = await StargateClient.connect(rpc);
    // lets get the sequence number for this transaction so we have to construct multi sig address
    const multiSigPubKey = createMultisigThresholdPubkey(multisig.members.map(mem => { return { type: "tendermint/PubKeySecp256k1", value: mem } }), Number(multisig.threshold));
    const multiSigAddress = pubkeyToAddress(multiSigPubKey, prefix);
    const sequence = await cosmClient.getSequence(multiSigAddress);

    // If the multisig takes just one signature threshold we can construct the full multisig tx and return it. No need to add it
    if (multisig.threshold === 1) {

      // So we have to map through the signatures and turn them into byte arrays
      const signatures = [
        {
          address: signer_address,
          signature: signature
        }
      ];
      const sigs = new Map(signatures.map((s) => [s.address, fromBase64(s.signature)]));
  
      const cosmClient = await StargateClient.connect(rpc);

      const signedTxBytes = makeMultisignedTxBytes(
        multiSigPubKey,
        sequence.sequence,
        fee,
        fromBase64(body_bytes),
        sigs,
      );

      // Broadcast tx
      const result = await cosmClient.broadcastTx(signedTxBytes);

      log(`Created & Broadcasted Multisig Transaction ${result.transactionHash}. (${JSON.stringify({
        ...result,
        gasUsed: result.gasUsed.toString(),
        gasWanted: result.gasWanted.toString(),
      })})`);

      if (result.code === 0) {
        return res.json({
          data: {
            ...result,
            gasUsed: result.gasUsed.toString(),
            gasWanted: result.gasWanted.toString(),
          },
          success: true,
          statusCode: 201
        });
      }

      // If not successful we just return the result as 500 server error
      return res.json({
        data: {
          ...result,
          gasUsed: result.gasUsed.toString(),
          gasWanted: result.gasWanted.toString(),
        },
        success: false,
        statusCode: 500
      });
    }

    const response = await database.createDocument("multisig", "transactions", ID.unique(), {
      signatures: [JSON.stringify({address: signer_address, signature})],
      chain_id,
      messages: JSON.parse(messages).map((m: EncodeObject) => JSON.stringify(m)),
      body_bytes: body_bytes,
      sequence: sequence.sequence,
      fee: JSON.stringify(fee)
    },
    [
      Permission.read(Role.any())
    ]);

    await database.updateDocument("multisig", "multisig", multisig.$id, {
      transactions: [response.$id]
    });

    log(`Created Multisig Transaction ${response.$id}. (${JSON.stringify(response)})`);

    return res.json({
      data: {
        tx_id: response.$id,
        chain_id,
        signer_address,
        threshold: multisig.threshold,
        signer_count: 1,
      },
      success: true
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