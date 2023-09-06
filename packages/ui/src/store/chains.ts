import { writable } from 'svelte/store';
import { getChainAddresses, getChains } from '../utils/snap';
import type { Chain } from '../../../snap/src/types/chains';

export const chains = writable<Chain[]>([]);

export async function fetchChains() {
  const allAddresses = await getChainAddresses();
  const allChains = await getChains();
  for (let i = 0; i < allChains.length; i++) {
    let item = allAddresses.filter(item => item.chain_id === allChains[i].chain_id);
    if (item.length == 0) {
      throw new Error(`Address not found for chain ${allChains[i].chain_id}`)
    }
    allChains[i].address = item[0].address
  }

  chains.set(allChains);

  return allChains
}