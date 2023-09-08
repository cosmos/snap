import { writable } from 'svelte/store';
import { getChainAddresses, getChains } from '../utils/snap';
import type { Chain } from '../../../snap/src/types/chains';
import { LOCAL_STORAGE_CHAINS } from '../utils/general';

export const chains = writable<Chain[]>([]);

export async function fetchChains() {
  let cacheChains = localStorage.getItem(LOCAL_STORAGE_CHAINS);
  if (cacheChains) {
    chains.set(JSON.parse(cacheChains));
  }
  const allAddresses = await getChainAddresses();
  const allChains = await getChains();
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

  return allChains
}