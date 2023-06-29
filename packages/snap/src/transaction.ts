import { DeliverTxResponse, SigningStargateClient } from "@cosmjs/stargate";
import { DirectSecp256k1Wallet } from "@cosmjs/proto-signing";
import { Fees } from "./types/chains";
import { ChainState } from "./state";

/**
 * submitTransaction Submits a transaction to the chain specified.
 *
 * @param args - The request handler args as object.
 * @returns The result of the method (boolean).
 * @throws If an error occurs.
 */
export const submitTransaction = async (
  chain_id: string,
  msgs: any[],
  fees: Fees | null = null
): Promise<DeliverTxResponse> => {
  // get the chain from state
  let chain = await ChainState.getChain(chain_id);

  // if fees are not specified then just use default fees + gas
  let ugas = chain.fees.fee_tokens[0].average_gas_price * 1000000;
  if (fees == null) {
    fees = {
      amount: [{ denom: chain.fees.fee_tokens[0].denom, amount: "500" }],
      gas: ugas.toString(),
    };
  }

  // get signer info
  let node = await snap.request({
    method: "snap_getBip44Entropy",
    params: {
      coinType: Number(chain.slip44),
    },
  });

  // create the wallet
  let wallet = await DirectSecp256k1Wallet.fromKey(
    Uint8Array.from(Buffer.from(node.privateKey!, "hex")),
    chain.bech32_prefix
  );
  let address = (await wallet.getAccounts())[0].address;

  // build signing client
  const client = await SigningStargateClient.connectWithSigner(
    chain.apis.rpc[0].address,
    wallet
  );

  // check chain id matches
  if ((await client.getChainId()) != chain_id) {
    throw new Error("CLIENT ERROR: Mismatching Chain Id");
  }

  // get the result and return it
  let result = await client.signAndBroadcast(address, msgs, fees);

  return result;
};
