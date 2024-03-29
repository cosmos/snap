import type { Chain } from '@cosmsnap/snapper';
import { chains } from './chains';
import { derived } from 'svelte/store';
import { denoUrl } from './balances';

export interface Transaction {
  address: string;
  chain: string;
  tx_hash: string;
  when: Date;
}

export async function getTransactions(chains: Chain[]): Promise<Transaction[]> {
  const res = await fetch(`${denoUrl}/transactions`, {
    method: "POST",
    body: JSON.stringify({ chains }),
  });
  let data = await res.json();
  return data.documents;
}

export async function addTransaction(data: {
  address: string;
  chain: string;
  when: string;
  tx_hash: string;
}) {
  try {
    const res = await fetch(`${denoUrl}/transactions/add`, {
      method: "POST", 
      body: JSON.stringify(data)
    });
    return await res.text();
  } catch (err) {
    throw err
  }
}

export const transactions = derived(chains, ($chains) => {
  return getTransactions($chains); 
});