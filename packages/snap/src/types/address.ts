export interface Address {
  name: string;
  address: string;
  chain_id: string;
}

export class Addresses {
  constructor(addresses: Address[]) {
    this.addresses = addresses;
  }

  addresses: Address[];

  addAddress(address: Address) {
    this.addresses.push(address);
  }

  /**
   * Turn all addresses into a JSON string using JSON stringify.
   *
   * @returns Stringified JSON of addresses.
   * @throws If an error occurs.
   */
  string() {
    return JSON.stringify(this.addresses);
  }
}

export interface addAddressParams {}
