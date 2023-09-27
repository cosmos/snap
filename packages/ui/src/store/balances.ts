import { writable, derived, type Writable, type Readable } from 'svelte/store';
import type { Chain } from '../../../snap/src/types/chains';
import { chains } from './chains'; 
import type { CoinIBC } from '../utils/ibc';

if (!import.meta.env.VITE_DENO_SERVERLESS_URL) {
    throw new Error("VITE_DENO_SERVERLESS_URL not set...");
}
export const denoUrl = import.meta.env.VITE_DENO_SERVERLESS_URL;

export interface ChainBalances extends Chain {
    balances: CoinIBC[];
}

// Store to hold a loading state
export const isLoading: Writable<boolean> = writable(false);

export let forceUpdate: () => void;

// The derived balances store
export const balances: Readable<ChainBalances[]> = derived(
    chains,
    ($chains, set: (value: ChainBalances[]) => void) => {
        forceUpdate = () => {
            updateBalances($chains, set);
        }
        updateBalances($chains, set);
    },
    [] as ChainBalances[]
);

export const updateBalances = async ($chains: Chain[], set: (value: ChainBalances[]) => void): Promise<void> => {
    isLoading.set(true);
    try {
        const res = await fetch(`${denoUrl}/balances`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
            body: JSON.stringify({ chains: $chains })
        });

        if (!res.ok) {
            throw new Error(`HTTP error ${res.status}`);
        }

        const data = await res.json();
        set(data.balances);
    } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
    } finally {
        isLoading.set(false);
    }
};