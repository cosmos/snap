import { writable } from 'svelte/store';
import { getChainAddresses, getChains } from '../utils/snap';
import type { Chain } from '@cosmsnap/snapper';
import { LOCAL_STORAGE_CHAINS } from '../utils/general';
import type { Multisig } from '../utils/appwrite';

export const chains = writable<Chain[]>([]);

export async function fetchChains(multisig: Multisig) {
  let allChains: Chain[] = [];
  try {
    allChains = await getChains();
    const allAddresses = await getChainAddresses(allChains, multisig);
    for (let i = 0; i < allChains.length; i++) {
      let item = allAddresses.filter(item => item.chain_id === allChains[i].chain_id);
      if (item.length == 0) {
        throw new Error(`Address not found for chain ${allChains[i].chain_id}`)
      }
      allChains[i].address = item[0].address
    }

    // save in local storage for cache
    localStorage.setItem(LOCAL_STORAGE_CHAINS, JSON.stringify(allChains));
    chains.set(allChains);
  } catch(err) {
    console.error(err);
  } finally {
    return allChains
  }
}