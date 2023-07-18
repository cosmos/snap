import { Chain } from "./types/chains";
import { registry } from "./types/registry";

/**
 * Initialize initial Cosmos chains into local storage from the chain registry.
 *
 * @returns The result of the method (boolean).
 * @throws If an error occurs.
 */
export const initializeChains = async (): Promise<Chain[]> => {
  // Call each default chain from chain registry urls using hardcoded list of default chains
  let retPromises = registry.map((chain) => fetch(chain.url));
  let rets = await Promise.all(retPromises);
  let all = await Promise.all(
    rets.map(async (ret) => {
      if (!ret.ok) {
        throw new Error(`HTTP error... status: ${ret.status}`);
      }
      return (await ret.json()) as Chain;
    })
  );

  return all;
};
