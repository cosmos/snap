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