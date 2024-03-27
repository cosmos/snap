import { writable, derived, type Writable, type Readable } from 'svelte/store';
import type { Chain } from '../../../snap/src/types/chains';
import { chains } from './chains'; 
import { getAkashNotifications, updateAkashNotifications } from '../utils/appwrite';

enum NotifType {
    CLOSED = "closed",
    OPEN = "open",
    PAUSED = "paused",
    OVERDRAWN = "overdrawn",
    INVALID = "invalid",
    INSUFFICIENT_FUNDS = "insufficient_funds",
    ACTIVE = "active"
}

export interface Notification {
    address: string;
    read: boolean;
    lease: string;
    notification: string;
    type: NotifType;
    timestamp: Number;
    chain_id: string;
}

// Store to hold a loading state
export const isLoading: Writable<boolean> = writable(false);

export let forceUpdateNotifications: () => void;

// The derived notifications store
export const notifications: Readable<Notification[]> = derived(
    chains,
    ($chains, set: (value: Notification[]) => void) => {
        forceUpdateNotifications = () => {
            getNotifications($chains, set);
        }
        getNotifications($chains, set);
    },
    [] as Notification[]
);

export const getNotifications = async ($chains: Chain[], set: (value: Notification[]) => void): Promise<void> => {
    isLoading.set(true);
    try {
        const akash = $chains.find(chain => chain.chain_id == "akashnet-2");
        if (!akash) {
            throw new Error("Akash chain not found. No notifications to be loaded.");
        }
        // Update the akash notifications for this address
        await updateAkashNotifications(akash.address!);
        const { success, data } = await getAkashNotifications(akash.address!);
        if (!success) {
            throw new Error("There was a problem fetching the notifications.");
        }

        set(data);
    } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
    } finally {
        isLoading.set(false);
    }
};