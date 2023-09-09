export const LOCAL_STORAGE_CHAINS = "cosmsnap:chains";
export const LOCAL_STORAGE_INIT = "cosmsnap:initialized";

export const copyToClipboard = async (text: string): Promise<void> => {
    if (text === null || text === undefined) {
        return;
    }

    try {
        await navigator.clipboard.writeText(text);
    } catch (err) {
        console.error(err);
        throw err
    }
};

export interface Transaction {
    address: string;
    chain: string;
    tx_hash: string;
    when: Date;
}