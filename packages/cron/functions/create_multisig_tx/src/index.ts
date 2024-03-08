import { Client, Databases, ID } from 'node-appwrite';
import { Multisig, RequestBody } from './types';
import { SigningStargateClient } from '@cosmjs/stargate'
import { pubkeyToAddress } from '@cosmjs/launchpad';
import { createMultisigThresholdPubkey } from '@cosmjs/amino';

type Context = {
  req: any;
  res: any;
  log: (msg: any) => void;
  error: (msg: any) => void;
};

export default async ({ req, res, log, error }: Context) => {

  try {

    if (req.method != "POST") {
      throw new Error(`Invalid request method: ${req.method}`);
    }
    if (!process.env.APPWRITE_FUNCTION_PROJECT_ID) {
      throw new Error("APPWRITE_FUNCTION_PROJECT_ID is not defined");
    }
    if (!process.env.APPWRITE_API_KEY) {
      throw new Error("APPWRITE_API_KEY is not defined");
    }

    const { multisig_id, chain_id, type_url, message, signature, address, rpc, prefix } = JSON.parse(req.bodyRaw) as RequestBody;

    if (!multisig_id) {
      throw new Error("multisig_id is required in body");
    }
    if (!chain_id) {
      throw new Error("chain_id is required in body");
    }
    if (!type_url) {
      throw new Error("type_url is required in body");
    }
    if (!message) {
      throw new Error("message is required in body");
    }
    if (!signature) {
      throw new Error("signature is required in body");
    }
    if (!address) {
      throw new Error("address is required in body");
    }
    if (!rpc) {
      throw new Error("rpc is required in body");
    }
    if (!prefix) {
      throw new Error("prefix is required in body");
    }

    const client = new Client()
      .setEndpoint('https://cloud.appwrite.io/v1')
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);
    
    const database = new Databases(client);

    const id = ID.unique();

    // Get the multisig info
    const doc = await database.getDocument("multisig", "multisigs", multisig_id);
    const multisig = doc as unknown as Multisig;

    const cosmClient = await SigningStargateClient.connect(rpc);
    // lets get the sequence number for this transaction so we have to construct multi sig address
    const multiSigPubKey = createMultisigThresholdPubkey(multisig.members.map(mem => JSON.parse(mem)), Number(multisig.threshold));
    const multiSigAddress = pubkeyToAddress(multiSigPubKey, prefix);
    const sequence = await cosmClient.getSequence(multiSigAddress);

    const response = await database.createDocument("multisig", "transactions", id, {
      signatures: [JSON.stringify([address, signature])],
      signed: [],
      multisigs: multisig,
      tx_id: ID.unique(),
      chain_id,
      type_url,
      message,
      sequence
    });

    log(`Created Multisig Transaction ${id}. (${JSON.stringify(response)})`);

    return res.json({
      data: response,
      success: true
    });

  } catch (e) {

    error(e);
    throw e;

  }

};