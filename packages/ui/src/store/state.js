import { writable } from 'svelte/store';

export const state = writable({
    connected: false,
    showMenu: true,
    openAddAddressPopup: false,
    openAddChainPopup: false,
    confirmDeleteChainPopup: false,
    alertText: "",
    showAlert: false,
    alertType: "success",
    isMetaMaskInstalledValue: false,
    isSnapInstalledValue: false,
    isSnapInitValue: false,
    loading: false
});