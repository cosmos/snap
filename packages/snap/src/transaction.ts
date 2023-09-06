import { DeliverTxResponse, SigningStargateClient } from "@cosmjs/stargate";
import { DirectSecp256k1Wallet } from "@cosmjs/proto-signing";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { HttpEndpoint } from "@cosmjs/stargate";
import { Fees } from "./types/chains";
import { ChainState } from "./state";
import { heading, panel, text } from "@metamask/snaps-ui";
import {
  WALLET_URL,
  DEFAULT_FEES,
  U_MULTIPLIER,
  DEFAULT_AVG_GAS,
} from "./constants";

/**
 * submitTransaction Submits a transaction to the chain specified.
 *
 * @param chain_id The id of the chain to submit the tx to
 * @param msgs List of messages to submit to the chain
 * @param fees Optional fees to include in transaction
 * @returns The Tx Response or undefined if failed.
 * @throws If an error occurs.
 */
export const submitTransaction = async (
  chain_id: string,
  msgs: any[],
  fees: Fees | null = null
): Promise<DeliverTxResponse | undefined> => {
  try {
    // get the chain from state
    let chain = await ChainState.getChain(chain_id);
    if (chain == null) {
      throw new Error(
        `Chain ${chain_id} not found. Please go to ${WALLET_URL} to add it!`
      );
    }

    // if fees are not specified then just use default fees + gas
    let avg_gas_price = chain.fees.fee_tokens[0].average_gas_price
      ? chain.fees.fee_tokens[0].average_gas_price
      : DEFAULT_AVG_GAS;
    let ugas = avg_gas_price * U_MULTIPLIER;
    if (fees == null) {
      fees = {
        amount: [
          { denom: chain.fees.fee_tokens[0].denom, amount: DEFAULT_FEES.gas },
        ],
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

    if (typeof node.privateKey === "undefined") {
      throw Error("Private key from node is undefined");
    }

    // Create bytes key
    let pk = node.privateKey;
    if (pk.startsWith("0x")) {
      pk = pk.substring(2);
    }

    // create the wallet
    let wallet = await DirectSecp256k1Wallet.fromKey(
      Uint8Array.from(Buffer.from(pk, "hex")),
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
  } catch (err: any) {
    console.error("Error During Broadcast: ", err.message);
    await snap.request({
      method: "snap_dialog",
      params: {
        type: "alert",
        content: panel([
          heading("Transaction Failed To Broadcast"),
          text(err.message),
        ]),
      },
    });
  }
};

/**
 * signTx Signs a transaction (direct) for the chain specified and returns the signed transaction.
 *
 * @param chain_id The id of the chain to submit the tx to
 * @param msgs List of messages to submit to the chain
 * @param fees Optional fees to include in transaction
 * @returns The Tx Response or undefined if failed.
 * @throws If an error occurs.
 */
export const signTx = async (
  chain_id: string,
  msgs: any[],
  fees: Fees | null = null
): Promise<Uint8Array | undefined> => {
  try {
    // get the chain from state
    let chain = await ChainState.getChain(chain_id);
    if (chain == null) {
      throw new Error(
        `Chain ${chain_id} not found. Please go to ${WALLET_URL} to add it!`
      );
    }

    // if fees are not specified then just use default fees + gas
    let avg_gas_price = chain.fees.fee_tokens[0].average_gas_price
      ? chain.fees.fee_tokens[0].average_gas_price
      : DEFAULT_AVG_GAS;
    let ugas = avg_gas_price * U_MULTIPLIER;
    if (fees == null) {
      fees = {
        amount: [
          { denom: chain.fees.fee_tokens[0].denom, amount: DEFAULT_FEES.gas },
        ],
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

    if (typeof node.privateKey === "undefined") {
      throw Error("Private key from node is undefined");
    }

    // Create bytes key
    let pk = node.privateKey;
    if (pk.startsWith("0x")) {
      pk = pk.substring(2);
    }

    // create the wallet
    let wallet = await DirectSecp256k1Wallet.fromKey(
      Uint8Array.from(Buffer.from(pk, "hex")),
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

    // get the signed tx and return it
    let result = await client.sign(address, msgs, fees, "");

    // compose the tx bytes
    let tx = TxRaw.encode(result).finish();

    return tx
  } catch (err: any) {
    console.error("Error During Broadcast: ", err.message);
    await snap.request({
      method: "snap_dialog",
      params: {
        type: "alert",
        content: panel([
          heading("Transaction Failed To Broadcast"),
          text(err.message),
        ]),
      },
    });
  }
};
