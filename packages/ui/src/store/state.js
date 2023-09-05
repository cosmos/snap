import { writable } from 'svelte/store';

export const state = writable({
    connected: false,
    openAddAddressPopup: false,
    openAddChainPopup: false,
    alertText: "",
    showAlert: false
});