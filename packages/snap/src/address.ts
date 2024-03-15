import { Chain } from "./types/chains";
import { getWallet } from "./wallet";

/**
 * getAddress Gets the address for the chain specified.
 *
 * @param chain The chain object to get the address for.
 * @returns A string that is the bech32 address prefixed with the chain prefix.
 * @throws If an error occurs.
 */
export const getAddress = async (chain: Chain): Promise<string> => {
  let wallet = await getWallet(chain)
  let address = (await wallet.getAccounts())[0].address;

  return address;
};
