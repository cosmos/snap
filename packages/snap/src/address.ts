import { DirectSecp256k1Wallet } from "@cosmjs/proto-signing";
import { Chain } from "./types/chains";

/**
 * getAddress Gets the address for the chain specified.
 *
 * @param chain The chain object to get the address for.
 * @returns A string that is the bech32 address prefixed with the chain prefix.
 * @throws If an error occurs.
 */
export const getAddress = async (chain: Chain): Promise<string> => {
  // get signer info
  let node = await snap.request({
    method: "snap_getBip44Entropy",
    params: {
      coinType: chain.slip44,
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

  return address;
};
