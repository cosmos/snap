import { DirectSecp256k1Wallet } from "@cosmjs/proto-signing";
import { Secp256k1Wallet } from "@cosmjs/amino";
import { Chain } from "./types/chains";
import { Buffer } from "buffer";

export const getWallet = async (chain: Chain) => {
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

      const wallet = await DirectSecp256k1Wallet.fromKey(
          Uint8Array.from(Buffer.from(pk, "hex")),
          chain.bech32_prefix
      )

      return wallet
};

export const getWalletAmino = async (chain: Chain) => {
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

      const wallet = await Secp256k1Wallet.fromKey(
          Uint8Array.from(Buffer.from(pk, "hex")),
          chain.bech32_prefix
      )

      return wallet
};