import { DirectSecp256k1Wallet } from "@cosmjs/proto-signing";
import { Secp256k1Wallet } from "@cosmjs/amino";
import { Chain } from "./types/chains";
import { getBIP44AddressKeyDeriver } from '@metamask/key-tree';

export const getWallet = async (chain: Chain) => {
    let wallet;
    // get signer info
    let node = await snap.request({
        method: "snap_getBip44Entropy",
        params: {
          coinType: Number(chain.slip44),
        },
      });

      // check if hd wallet or non-hd
      let state = await snap.request({
        method: "snap_manageState",
        params: { operation: "get" },
      });
  
      if (state != null && state.hd) {
        const deriveAddress = await getBIP44AddressKeyDeriver(node);
        let hdNode = await deriveAddress(0);

        if (!hdNode.privateKey) {
            throw new Error("HD private key derivation failed.")
        }
        
        // Create bytes key
        let pk = hdNode.privateKey;
        if (pk.startsWith("0x")) {
            pk = pk.substring(2);
        }
        
        wallet = await DirectSecp256k1Wallet.fromKey(
            Uint8Array.from(Buffer.from(pk, "hex")),
            chain.bech32_prefix
        )
      } else {
        if (typeof node.privateKey === "undefined") {
            throw Error("Private key from node is undefined");
        }
    
        // Create bytes key
        let pk = node.privateKey;
        if (pk.startsWith("0x")) {
        pk = pk.substring(2);
        }

        wallet = await DirectSecp256k1Wallet.fromKey(
            Uint8Array.from(Buffer.from(pk, "hex")),
            chain.bech32_prefix
        )
      }

      return wallet
};

export const getWalletAmino = async (chain: Chain) => {
    let wallet;
    // get signer info
    let node = await snap.request({
        method: "snap_getBip44Entropy",
        params: {
          coinType: Number(chain.slip44),
        },
      });

      // check if hd wallet or non-hd
      let state = await snap.request({
        method: "snap_manageState",
        params: { operation: "get" },
      });
  
      if (state != null && state.hd) {
        const deriveAddress = await getBIP44AddressKeyDeriver(node);
        let hdNode = await deriveAddress(0);

        if (!hdNode.privateKey) {
            throw new Error("HD private key derivation failed.")
        }
        
        // Create bytes key
        let pk = hdNode.privateKey;
        if (pk.startsWith("0x")) {
            pk = pk.substring(2);
        }
        
        wallet = await Secp256k1Wallet.fromKey(
            Uint8Array.from(Buffer.from(pk, "hex")),
            chain.bech32_prefix
        )
      } else {
        if (typeof node.privateKey === "undefined") {
            throw Error("Private key from node is undefined");
        }
    
        // Create bytes key
        let pk = node.privateKey;
        if (pk.startsWith("0x")) {
        pk = pk.substring(2);
        }

        wallet = await Secp256k1Wallet.fromKey(
            Uint8Array.from(Buffer.from(pk, "hex")),
            chain.bech32_prefix
        )
      }

      return wallet
};