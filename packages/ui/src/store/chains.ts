import { writable } from 'svelte/store';
import { type ChainClient, createAllChains } from '../utils/chains';

export const chains = writable<(ChainClient | null)[]>([]);

export const fetchAllClients = async () => {
    try {
        const clients = await createAllChains();

        chains.set(clients);
    } catch (error) {
        console.error('Error fetching all clients:', error);
        chains.set([]);
    }
};