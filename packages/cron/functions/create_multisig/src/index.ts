import { Client, Databases } from 'node-appwrite';
import { createMultisigThresholdPubkey, pubkeyToAddress } from '@cosmjs/amino';

export default async ({ req, res, log, error }) => {

  try {

    if (req.method != "POST") {
      throw new Error(`Invalid request method: ${req.method}`);
    }

    const { pubKeys, threshold, name } = req.body;

    const client = new Client()
      .setEndpoint('https://cloud.appwrite.io/v1')
      .setProject(process​.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(process​.env.APPWRITE_API_KEY);
    
    const database = new Databases(client);

    // Create a multisig account/address
    const multiSigPubKey = createMultisigThresholdPubkey(pubKeys, threshold);

    const address = pubkeyToAddress(multiSigPubKey, "akash");

    // Add the multisig into the database. We use akash address as the document ID for convenience
    const response = database.createDocument("multisig", "multisigs", address, {
      name,
      threshold,
      members: pubKeys,
      akash_address: address
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