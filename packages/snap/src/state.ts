import { Chains, Chain, CosmosAddress, UpdateChainParams } from "./types/chains";
import { Addresses, Address } from "./types/address";
import { AccountData, DirectSecp256k1Wallet } from "@cosmjs/proto-signing";
import { DEFAULT_SLIP44, WALLET_URL } from "./constants";
import { getWallet } from "./wallet";

/**
 * ChainState is the class to manage all Chain state within Metamask.
 */
export class ChainState {
  /**
   * Get the chain ids bech32 addresses for all chains in state.
   *
   * @returns The bech32 prefixed addresses in a list.
   * @throws If an error occurs.
   */
  public static async getChainAddresses(): Promise<CosmosAddress[]> {
    let chains = await this.getChains();

    let addressesP = chains.chains.map(async (item) => {
      return this.getChainAddress(item.chain_id);
    });
    let addresses = await Promise.all(addressesP);

    return addresses;
  }
  /**
   * Get the chain ids bech32 address.
   *
   * @returns The bech32 prefixed address.
   * @throws If an error occurs.
   */
  public static async getChainAddress(
    chain_id: string
  ): Promise<CosmosAddress> {
    let chain = await this.getChain(chain_id);
    if (chain == null) {
      throw new Error(`Chain with Chain Id ${chain_id} does not exist.`);
    }

    let wallet = await getWallet(chain);

    let address = (await wallet.getAccounts())[0].address;

    return {
      address,
      chain_id,
    };
  }
  /**
   * Gets the public key for this wallet.
   *
   * @returns The public key in hex string.
   * @throws If an error occurs.
   */
  public static async GetAccount(
    chain_id: string
  ): Promise<AccountData> {
    let chain = await this.getChain(chain_id);
    if (chain == null) {
      throw new Error(`Chain with Chain Id ${chain_id} does not exist.`);
    }

    let wallet = await getWallet(chain);

    let account = (await wallet.getAccounts())[0];

    return account;
  }
  /**
   * Gets all Cosmos chains from Metamask snap state.
   *
   * @returns All chains in Metamask snap state.
   * @throws If an error occurs.
   */
  public static async getChains(): Promise<Chains> {
    let data = await snap.request({
      method: "snap_manageState",
      params: { operation: "get" },
    });
    if (data?.chains == null) {
      throw new Error("Snap has not been initialized. Please initialize snap.");
    }
    return new Chains(JSON.parse(data?.chains?.toString()!));
  }
  /**
   * Gets a Cosmos chain based on its chain id from Metamask snap state.
   *
   * @returns Chain object you want.
   * @throws If an error occurs.
   */
  public static async getChain(chain_id: string): Promise<Chain | null> {
    const data = await snap.request({
      method: "snap_manageState",
      params: { operation: "get" },
    });
    if (data?.chains == null) {
      throw new Error("Snap has not been initialized. Please initialize snap.");
    }
    let chains = new Chains(JSON.parse(data?.chains?.toString()!));
    let chain = chains.getChain(chain_id);
    return chain;
  }
  /**
   * Adds a new Cosmos chain into the current Metamask snap state.
   *
   * @param chain Chain object to add into state.
   * @returns The current state of Chains.
   * @throws If an error occurs.
   */
  public static async addChain(chain: Chain): Promise<Chains> {
    // get the current state of chains in Metamask we will add chain into
    const data = await snap.request({
      method: "snap_manageState",
      params: { operation: "get" },
    });

    // parse the JSON data into a plain object
    let parsedData = JSON.parse(data?.chains?.toString()!);

    // create a new Chains object and populate it with the parsed data
    let chains = new Chains(parsedData);

    // add the chain into chains class
    chains.addChain(chain);

    // update Metamask state with new chain state
    await snap.request({
      method: "snap_manageState",
      params: {
        operation: "update",
        newState: { ...data, chains: chains.string() },
      },
    });

    return chains;
  }
  /**
   * Adds a new Cosmos chain into the current Metamask snap state.
   *
   * @param chain Chain object to add into state.
   * @returns The current state of Chains.
   * @throws If an error occurs.
   */
  public static async updateChain(chain_id: string, updates: UpdateChainParams): Promise<Chain> {
    // get the current state of chains in Metamask we will add chain into
    const data = await snap.request({
      method: "snap_manageState",
      params: { operation: "get" },
    });

    // parse the JSON data into a plain object
    let parsedData = JSON.parse(data?.chains?.toString()!);

    // create a new Chains object and populate it with the parsed data
    let chains = new Chains(parsedData);

    // update the chain in the chain class
    const updatedChain = chains.updateChain(chain_id, updates);

    // update Metamask state with new chain state
    await snap.request({
      method: "snap_manageState",
      params: {
        operation: "update",
        newState: { ...data, chains: chains.string() },
      },
    });

    return updatedChain;
  }
  /**
   * Adds a list of Chains as state into Metamask snap.
   *
   * WARNING: This replaces the entire state within Metamask so any chains in state will be replaced.
   *
   * @param chains Chains to replace entire Metamask chain state with.
   * @returns Returns the current state of Chains.
   * @throws If an error occurs.
   */
  public static async replaceAllChains(chains: Chains): Promise<Chains> {
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
    return chains;
  }
  public static async removeChain(chain_id: string): Promise<Chains> {
    // get the current state of chains in Metamask we will add chain into
    const data = await snap.request({
      method: "snap_manageState",
      params: { operation: "get" },
    });
    if (data?.chains == null) {
      throw new Error("Snap has not been initialized. Please initialize snap.");
    }
    // remember we keep chain stores as a json string so convert into a Chains object
    let chains = new Chains(JSON.parse(data?.chains?.toString()!));
    let keepChains = chains.chains.filter((item) => item.chain_id !== chain_id);
    // update chains
    chains.chains = keepChains;

    // update Metamask state with new chain state
    await snap.request({
      method: "snap_manageState",
      params: {
        operation: "update",
        newState: { ...data, chains: chains.string() },
      },
    });

    return chains;
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

    if (data?.addresses == null) {
      throw new Error(
        "Address book was not found. Add an address to address book to initialize."
      );
    }

    if (typeof data?.addresses !== "string") {
      throw new Error(
        "Invalid address book data. Addresses should be a JSON string."
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

    if (data?.addresses == null) {
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
        `${chain_id} is not found. Add the address to your address book at ${WALLET_URL}`
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
  public static async addAddress(address: Address): Promise<Addresses> {
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
        newState: { ...data, addresses: addresses.string() },
      },
    });

    return addresses;
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
  public static async replaceAllAddresses(
    addresses: Addresses
  ): Promise<Boolean> {
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

  public static async removeAddress(address: string): Promise<Addresses> {
    // get the current state of addresses in Metamask we will add address into
    const data = await snap.request({
      method: "snap_manageState",
      params: { operation: "get" },
    });

    if (data?.addresses == null) {
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
        newState: { ...data, addresses: addresses.string() },
      },
    });

    return addresses;
  }
}
