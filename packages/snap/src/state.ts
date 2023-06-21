import { Chains, Chain } from "./types/chains";
import { Addresses, Address } from "./types/address";

/**
 * ChainState is the class to manage all Chain state within Metamask.
 */
export class ChainState {
  /**
   * Gets all Cosmos chains from Metamask snap state.
   *
   * @returns All chains in Metamask snap state.
   * @throws If an error occurs.
   */
  public static async getChains(): Promise<Chains> {
    const data = await snap.request({
      method: "snap_manageState",
      params: { operation: "get" },
    });
    if (data?.chains == undefined || data?.chains == null) {
      throw new Error("Snap has not been initialized. Please initialize snap.");
    }
    return JSON.parse(data?.chains?.toString()!);
  }
  /**
   * Gets a Cosmos chain based on its chain id from Metamask snap state.
   *
   * @returns Chain object you want.
   * @throws If an error occurs.
   */
  public static async getChain(chain_id: string) {
    const data = await snap.request({
      method: "snap_manageState",
      params: { operation: "get" },
    });
    let chains: Chains = JSON.parse(data?.chains?.toString()!);
    if (data?.chains == undefined || data?.chains == null) {
      throw new Error("Snap has not been initialized. Please initialize snap.");
    }
    let chainList = chains.chains.filter((item) => item.chain_id === chain_id);
    if (chainList.length == 0) {
      throw new Error(
        `${chain_id} is not found. Add the chain to your wallet at https://wallet.mysticlabs.xyz`
      );
    }
    return chainList[0];
  }
  /**
   * Adds a new Cosmos chain into the current Metamask snap state.
   *
   * @param chain Chain object to add into state.
   * @returns Boolean indicating success or not.
   * @throws If an error occurs.
   */
  public static async addChain(chain: Chain) {
    // get the current state of chains in Metamask we will add chain into
    const data = await snap.request({
      method: "snap_manageState",
      params: { operation: "get" },
    });
    // remember we keep chain stores as a json string so convert into a Chains object
    let chains: Chains = JSON.parse(data?.chains?.toString()!);

    // add the chain into chains class
    chains.addChain(chain);
    // update Metamask state with new chain state
    await snap.request({
      method: "snap_manageState",
      params: { operation: "update", newState: { chains: chains.string() } },
    });
  }
  /**
   * Adds a list of Chains as state into Metamask snap.
   *
   * WARNING: This replaces the entire state within Metamask so any chains in state will be replaced.
   *
   * @param chains Chains to replace entire Metamask chain state with.
   * @returns Boolean indicating success or not.
   * @throws If an error occurs.
   */
  public static async addChains(chains: Chains): Promise<Boolean> {
    // get current state
    const data = await snap.request({
      method: "snap_manageState",
      params: { operation: "get" },
    });
    // update Metamask state with new chain state
    await snap.request({
      method: "snap_manageState",
      params: {
        operation: "update",
        newState: { ...data, chains: chains.string() },
      },
    });
    return true;
  }
  public static async removeChain(chain_id: string) {
    // get the current state of chains in Metamask we will add chain into
    const data = await snap.request({
      method: "snap_manageState",
      params: { operation: "get" },
    });
    if (data?.chains == undefined || data?.chains == null) {
      throw new Error("Snap has not been initialized. Please initialize snap.");
    }
    // remember we keep chain stores as a json string so convert into a Chains object
    let chains: Chains = JSON.parse(data?.chains?.toString()!);
    let keepChains = chains.chains.filter((item) => item.chain_id !== chain_id);
    // update chains
    chains.chains = keepChains;

    // update Metamask state with new chain state
    await snap.request({
      method: "snap_manageState",
      params: { operation: "update", newState: { chains: chains.string() } },
    });
  }
}

/**
 * AddressState is the class to manage all address book state within Metamask.
 */
export class AddressState {
  /**
   * Gets all Cosmos addresses from Metamask snap state.
   *
   * @returns All Addresses in Metamask snap state.
   * @throws If an error occurs.
   */

  public static async getAddressBook(): Promise<Addresses> {
    // get the current state of addresses in Metamask
    const data = await snap.request({
      method: "snap_manageState",
      params: { operation: "get" },
    });

    if (data?.addresses == undefined || data?.addresses == null) {
      throw new Error(
        "Address book was not found. Add an address to address book to initialize."
      );
    }

    if (typeof data?.addresses !== "string") {
      throw new Error(
        "Invalid address book data. Addresses should be a string."
      );
    }

    // convert into a Addresses object and return the object
    return JSON.parse(data?.addresses as string);
  }

  /**
   * Gets a address from address book based on its chain id from Metamask snap state.
   *
   * @returns Address object you want.
   * @throws If an error occurs.
   */

  public static async getAddress(chain_id: string) {
    const data = await snap.request({
      method: "snap_manageState",
      params: { operation: "get" },
    });

    if (data?.addresses == undefined || data?.addresses == null) {
      throw new Error(
        "Address book was not found. Add an address to address book to initialize."
      );
    }

    if (typeof data?.addresses !== "string") {
      throw new Error(
        "Invalid address book data. Addresses should be a string."
      );
    }

    // remember we keep address stores as a json string so convert into a Addresses object
    let addresses = new Addresses(JSON.parse(data?.addresses as string));

    let addressList = addresses.addresses.filter(
      (item) => item.chain_id === chain_id
    );

    if (addressList.length == 0) {
      throw new Error(
        `${chain_id} is not found. Add the address to your address book at https://wallet.mysticlabs.xyz`
      );
    }

    return addressList[0];
  }

  /**
   * Adds a new address into the current Metamask snap state.
   *
   * @param address Address object to add into state.
   * @returns Boolean indicating success or not.
   * @throws If an error occurs.
   */
  public static async addAddress(address: Address) {
    // get the current state of addresses in Metamask we will add address into
    const data = await snap.request({
      method: "snap_manageState",
      params: { operation: "get" },
    });

    if (typeof data?.addresses !== "string") {
      throw new Error(
        "Invalid address book data. Addresses should be a string."
      );
    }

    // remember we keep address stores as a json string so convert into a Addresses object
    let addresses = new Addresses(JSON.parse(data?.addresses as string));

    // add the address into addresses class
    addresses.addAddress(address);

    // update Metamask state with new address state
    await snap.request({
      method: "snap_manageState",
      params: {
        operation: "update",
        newState: { addresses: addresses.string() },
      },
    });

    return true;
  }

  /**
   * Adds a list of addresses as state into Metamask snap.
   *
   * WARNING: This replaces the entire state within Metamask so any Address Book in state will be replaced.
   *
   * @param addresses Addresses to replace entire Metamask Address Book state with.
   * @returns Boolean indicating success or not.
   * @throws If an error occurs.
   */
  public static async addAddresses(addresses: Addresses): Promise<Boolean> {
    // get current state
    const data = await snap.request({
      method: "snap_manageState",
      params: { operation: "get" },
    });

    if (typeof data?.addresses !== "string") {
      throw new Error(
        "Invalid address book data. Addresses should be a string."
      );
    }

    // update Metamask state with new addresses state
    await snap.request({
      method: "snap_manageState",
      params: {
        operation: "update",
        newState: { ...data, addresses: addresses.string() },
      },
    });

    return true;
  }

  public static async removeAddress(address: string) {
    // get the current state of addresses in Metamask we will add address into
    const data = await snap.request({
      method: "snap_manageState",
      params: { operation: "get" },
    });

    if (data?.addresses == undefined || data?.addresses == null) {
      throw new Error("Snap has not been initialized. Please initialize snap.");
    }

    if (typeof data?.addresses !== "string") {
      throw new Error(
        "Invalid address book data. Addresses should be a string."
      );
    }

    // remember we keep address stores as a json string so convert into a Addresses object
    let addresses = new Addresses(JSON.parse(data?.addresses as string));
    let keepAddresses = addresses.addresses.filter(
      (item) => item.address !== address
    );

    // update addresses
    addresses.addresses = keepAddresses;

    // update Metamask state with new address state
    await snap.request({
      method: "snap_manageState",
      params: {
        operation: "update",
        newState: { addresses: addresses.string() },
      },
    });

    return true;
  }
}
