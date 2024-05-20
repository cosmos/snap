import { type Writable, writable } from 'svelte/store';

interface MultiSig {
    transactions: any[];
    threshold: number;
    members: string[];
    name: string;
    public_key: string;
    akash_address: string;
    $id: string;
}

interface AppState {
    connected: boolean;
    showMenu: boolean;
    openAddAddressPopup: boolean;
    openAddChainPopup: boolean;
    confirmDeleteChainPopup: boolean;
    openAddMultisigPopup: boolean;
    alertText: string;
    showAlert: boolean;
    alertType: 'success' | 'warning' | 'danger';
    isSnapInstalled: boolean;
    isSnapLatestVersion: boolean;
    loading: boolean;
    currentMultiSig: MultiSig;
}

export const state: Writable<AppState> = writable({
    connected: false,
    showMenu: true,
    openAddAddressPopup: false,
    openAddChainPopup: false,
    confirmDeleteChainPopup: false,
    openAddMultisigPopup: false,
    alertText: "",
    showAlert: false,
    alertType: "success",
    isSnapInstalled: false,
    isSnapLatestVersion: false,
    loading: false,
    currentMultiSig: {
        transactions: [],
        threshold: 0,
        members: [""],
        name: "",
        public_key: "",
        akash_address: "",
        $id: ""
    }
});