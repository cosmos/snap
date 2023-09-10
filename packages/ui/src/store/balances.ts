import { writable, derived, type Writable, type Readable } from 'svelte/store';
import type { Chain } from '../../../snap/src/types/chains';
import { chains } from './chains'; 
import type { CoinIBC } from '../utils/ibc';

export interface ChainBalances extends Chain {
    balances: CoinIBC[];
}

// Store to hold a loading state
export const isLoading: Writable<boolean> = writable(false);

// The derived balances store
export const balances: Readable<ChainBalances[]> = derived(
    chains,
    ($chains, set: (value: ChainBalances[]) => void) => {
        updateBalances($chains, set);
    },
    [] as ChainBalances[]
);

const updateBalances = async ($chains: Chain[], set: (value: ChainBalances[]) => void): Promise<void> => {
    // Set loading state to true
    isLoading.set(true);
    try {
        const res = await fetch('https://balancefunction.joeschnetzler.repl.co/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
        // Set loading state back to false
        isLoading.set(false);
    }
};