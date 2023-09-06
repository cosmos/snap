import { writable } from 'svelte/store';
import type { Chain } from '../../../snap/src/types/chains';
import type { Coin } from '@cosmjs/stargate';

interface ChainBalances extends Chain {
    balances: Coin[];
}

export const balances = writable<ChainBalances[]>([]);