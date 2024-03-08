import { DeliverTxResponse, SigningStargateClient } from "@cosmjs/stargate";
import { encodeSecp256k1Signature, serializeSignDoc } from "@cosmjs/amino";
import { Secp256k1, sha256 } from "@cosmjs/crypto";
import { AccountData, DirectSignResponse, OfflineDirectSigner, makeSignBytes } from "@cosmjs/proto-signing";
import { AminoSignResponse, StdSignDoc } from "@cosmjs/amino";
import { Chain, Fees } from "./types/chains";
import { ChainState } from "./state";
import { heading, panel, text } from "@metamask/snaps-ui";
import {
  WALLET_URL,
  DEFAULT_FEES,
  U_MULTIPLIER,
  DEFAULT_AVG_GAS,
} from "./constants";
import { SignDoc } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { getAddress } from "./address";
import { getWallet, getWalletAmino } from "./wallet";

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

    let wallet = await getWallet(chain);
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
 * sendTx Broadcasts a signed transaction to the chain.
 *
 * @param chain_id The id of the chain to submit the tx to
 * @param tx The signed tx
 * @param mode Broadcast mode
 * @returns The Tx Response in bytes.
 * @throws If an error occurs.
 */
export const sendTx = async (
  chain_id: string,
  tx: Uint8Array,
): Promise<DeliverTxResponse | undefined> => {
  try {
    // get the chain from state
    let chain = await ChainState.getChain(chain_id);
    if (chain == null) {
      throw new Error(
        `Chain ${chain_id} not found. Please go to ${WALLET_URL} to add it!`
      );
    }

    let wallet = await getWallet(chain);

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
    let result = await client.broadcastTx(tx);

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
 * signDirect Signs a transaction (direct) for the chain specified and returns the SignResponse.
 * This is a drop in replacement for Keplr.
 *
 * @param chain_id The id of the chain to submit the tx to
 * @param signer The bech32 address of the signer
 * @param sign_doc The signdoc to sign
 * @returns The Tx Response or undefined if failed.
 * @throws If an error occurs.
 */
export const signDirect = async (
  chain_id: string,
  signer: string,
  sign_doc: SignDoc
): Promise<any> => {
  try {
    // get the chain from state
    let chain = await ChainState.getChain(chain_id);
    if (chain == null) {
      throw new Error(
        `Chain ${chain_id} not found. Please go to ${WALLET_URL} to add it!`
      );
    }

    let wallet = await getWallet(chain);

    let response = await wallet.signDirect(signer, sign_doc);

    return {
      signed: { ...sign_doc, accountNumber: sign_doc.accountNumber.toString() },
      signature: response.signature,
    };
  } catch (err: any) {
    console.error("Error During SignDirect: ", err.message);
    await snap.request({
      method: "snap_dialog",
      params: {
        type: "alert",
        content: panel([
          heading("Transaction Failed To Sign"),
          text(err.message),
        ]),
      },
    });
  }
};

/**
 * signAmino Signs a transaction (Amino) for the chain specified and returns the AminoSignResponse.
 * This is a drop-in replacement for Amino signing.
 *
 * @param chain_id The id of the chain to submit the tx to
 * @param signer The bech32 address of the signer
 * @param sign_doc The signdoc to sign
 * @returns The Tx Response or undefined if failed.
 * @throws If an error occurs.
 */
export const signAmino = async (
  chain_id: string,
  signer: string,
  sign_doc: StdSignDoc
): Promise<AminoSignResponse | undefined> => {
  try {
    // get the chain from state
    let chain = await ChainState.getChain(chain_id);
    if (chain == null) {
      throw new Error(
        `Chain ${chain_id} not found. Please go to ${WALLET_URL} to add it!`
      );
    }

    let wallet = await getWalletAmino(chain);

    let response = await wallet.signAmino(signer, sign_doc);

    return response;
  } catch (err: any) {
    console.error("Error During signAmino: ", err.message);
    await snap.request({
      method: "snap_dialog",
      params: {
        type: "alert",
        content: panel([
          heading("Transaction Failed To Sign"),
          text(err.message),
        ]),
      },
    });
  }
};

export class Wallet implements OfflineDirectSigner {
  /**
   * Creates a DirectSecp256k1Wallet from the given private key
   *
   * @param privkey The private key.
   * @param prefix The bech32 address prefix (human readable part). Defaults to "cosmos".
   */
  public static async fromKey(privkey: Uint8Array, chain: Chain): Promise<Wallet> {
    const uncompressed = (await Secp256k1.makeKeypair(privkey)).pubkey;
    return new Wallet(privkey, Secp256k1.compressPubkey(uncompressed), chain);
  }

  private readonly pubkey: Uint8Array;
  private readonly privkey: Uint8Array;
  private readonly chain: Chain;

  private constructor(privkey: Uint8Array, pubkey: Uint8Array, chain: Chain) {
    this.privkey = privkey;
    this.pubkey = pubkey;
    this.chain = chain;
  }

  public async getAccounts(): Promise<readonly AccountData[]> {
    let account = await getAddress(this.chain)
    return [
      {
        algo: "secp256k1",
        address: account,
        pubkey: this.pubkey,
      },
    ];
  }

  public async signDirect(address: string, signDoc: SignDoc): Promise<DirectSignResponse> {
    const signBytes = makeSignBytes(signDoc);
    let checkAddress = await getAddress(this.chain);
    if (address !== checkAddress) {
      throw new Error(`Address ${address} not found in wallet`);
    }
    const hashedMessage = sha256(signBytes);
    const signature = await Secp256k1.createSignature(hashedMessage, this.privkey);
    const signatureBytes = new Uint8Array([...signature.r(32), ...signature.s(32)]);
    const stdSignature = encodeSecp256k1Signature(this.pubkey, signatureBytes);
    return {
      signed: signDoc,
      signature: stdSignature,
    };
  }

  public async signAmino(signerAddress: string, signDoc: StdSignDoc): Promise<AminoSignResponse> {
    let checkAddress = await getAddress(this.chain);
    if (signerAddress !== checkAddress) {
      throw new Error(`Address ${signerAddress} not found in wallet`);
    }
    const message = sha256(serializeSignDoc(signDoc));
    const signature = await Secp256k1.createSignature(message, this.privkey);
    const signatureBytes = new Uint8Array([...signature.r(32), ...signature.s(32)]);
    return {
      signed: signDoc,
      signature: encodeSecp256k1Signature(this.pubkey, signatureBytes),
    };
  }
}