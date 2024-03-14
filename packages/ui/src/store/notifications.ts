import { writable, derived, type Writable, type Readable } from 'svelte/store';
import type { Chain } from '../../../snap/src/types/chains';
import { chains } from './chains'; 

enum NotifType {
    CLOSED = "closed",
    OPEN = "open",
    PAUSED = "paused",
    OVERDRAWN = "overdrawn",
    INVALID = "invalid",
    INSUFFICIENT_FUNDS = "insufficient_funds",
    ACTIVE = "active"
}

export interface Notif {
    address: string;
    read: boolean;
    lease: string;
    notification: string;
    type: NotifType;
    timestamp: Number;
}

if (!import.meta.env.VITE_APPWRITE_URL) {
    throw new Error("VITE_APPWRITE_URL not set...");
}
export const appwriteURL = import.meta.env.VITE_APPWRITE_URL;

export interface ChainBalances extends Chain {
    notifications: Notif[];
}

// Store to hold a loading state
export const isLoading: Writable<boolean> = writable(false);

export let forceUpdateNotifications: () => void;

// The derived notifications store
export const notifications: Readable<ChainBalances[]> = derived(
    chains,
    ($chains, set: (value: ChainBalances[]) => void) => {
        forceUpdateNotifications = () => {
            getNotifications($chains, set);
        }
        getNotifications($chains, set);
    },
    [] as ChainBalances[]
);

export const getNotifications = async ($chains: Chain[], set: (value: ChainBalances[]) => void): Promise<void> => {
    isLoading.set(true);
    try {
        const addresses = $chains.map((chain) => chain.address);
        const res = await fetch(`${appwriteURL}/akash_notifications?addresses=${JSON.stringify(addresses)}`);

        if (!res.ok) {
            throw new Error(`HTTP error ${res.status}`);
        }

        const data = await res.json();
        set(data.notifications);
    } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
    } finally {
        isLoading.set(false);
    }
};