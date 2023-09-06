import { writable } from 'svelte/store';
import type { Address } from '../../../snap/src/types/address';
import { getAddresses } from '../utils/snap';

export const addressbook = writable<Address[]>([]);

export async function getAddressBook() {
    const allAddresses = await getAddresses();
    addressbook.set(allAddresses);

    return allAddresses
}