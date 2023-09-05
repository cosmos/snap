import { writable } from 'svelte/store';
import { getAllBalances } from '../utils/balances';

/**
 * @type {import('../utils/query').ChainBalances[] | undefined}
 */
let initialBalance = [];

const balances = writable(initialBalance);

export const fetchAllBalances = async () => {
  try {
    const balancesAll = await getAllBalances();

    balances.set(balancesAll);
  } catch (error) {
    console.error("Error fetching balances:", error);
    throw error
  }
};

export default balances;