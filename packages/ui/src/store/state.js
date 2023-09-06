import { writable } from 'svelte/store';

export const state = writable({
    connected: false,
    showMenu: false,
    openAddAddressPopup: false,
    openAddChainPopup: false,
    confirmDeleteChainPopup: false,
    alertText: "",
    showAlert: false
});