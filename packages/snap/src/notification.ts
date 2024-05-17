import { denoUrl } from "./utils";

export class Notifications {
    deno_url: string;
    constructor() {
        this.deno_url = denoUrl;
    }

    getAkashNotifications = async (akash_address: string) => {
        const url = `${this.deno_url}/notifications?akash_address=${akash_address}`;
        const headers = {
            'Content-Type': 'application/json'
        };
        try {
            const raw = await fetch(url, {
                method: 'GET',
                headers,
            });
            if (!raw.ok) {
                throw new Error(`HTTP error ${raw.status}`);
            }
            const res = await raw.json();
            return res.data;
        } catch (err) {
            console.log(err);
            throw new Error(`${err}`);
        }
    };

    updateAkashNotifications = async (akash_address: string) => {
        const url = `${this.deno_url}/notifications`;
        const headers = {
            'Content-Type': 'application/json'
        };
        const body = {
            akash_address
        };
        try {
            const raw = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(body)
            });
            if (!raw.ok) {
                throw new Error(`HTTP error ${raw.status}`);
            }
            const res = await raw.json();
            return res.data;
        } catch (err) {
            console.log(err);
            throw new Error(`${err}`);
        }
    };

    markNotificationRead = async (doc_id: string) => {
        const url = `${this.deno_url}/notifications/read`;
        const headers = {
            'Content-Type': 'application/json'
        };
        const body = {
            doc_id
        };
        try {
            const raw = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(body)
            });
            const res = await raw.json();
            return res.data;
        } catch (err) {
            console.log(err);
            throw new Error(`${err}`);
        }
    }
}

export const snapNotify = async (akash_address: string) => {
    const notifications = new Notifications();
    // Update the notifications in Appwrite database
    await notifications.updateAkashNotifications(akash_address);
    // Get the notifications that are unread in Appwrite database
    const notifs = await notifications.getAkashNotifications(akash_address);
    if (!Array.isArray(notifs)) {
        throw new Error("Expected an array of notifications, received:", notifs);
    }
    // Post notifications to Metamask after filtering for unread
    const filtered = notifs.filter((notif) => !notif.read);
    for (const notif of filtered) {
        await snap.request({
            method: "snap_notify",
            params: {
                type: "inApp",
                message: notif.notification,
            },
        });
        // Update notification as read
        await notifications.markNotificationRead(
            notif.$id
        );
    }
};