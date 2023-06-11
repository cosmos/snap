import '@metamask/snaps-types';
import { Chains, Chain } from '../types/chains';

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
            method: 'snap_manageState',
            params: { operation: 'get' },
        });
        if (data?.chains == undefined || data?.chains == null) {
            throw new Error("Snap has not been initialized. Please initialize snap.")
        }
        return JSON.parse(data?.chains?.toString()!)
    }
    /**
     * Gets a Cosmos chain based on its chain id from Metamask snap state.
     *
     * @returns Chain object you want.
     * @throws If an error occurs.
     */
    public static async getChain(chain_id: string) {
        const data = await snap.request({
            method: 'snap_manageState',
            params: { operation: 'get' },
        });
        let chains: Chains = JSON.parse(data?.chains?.toString()!);
            if (data?.chains == undefined || data?.chains == null) {
            throw new Error("Snap has not been initialized. Please initialize snap.")
        }
        let chainList = chains.chains.filter(item => item.chain_id === chain_id);
        if (chainList.length == 0) {
            throw new Error(`${chain_id} is not found. Add the chain to your wallet at https://wallet.mysticlabs.xyz`)
        }
        return chainList[0]
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
            method: 'snap_manageState',
            params: { operation: 'get' },
        });
        // remember we keep chain stores as a json string so convert into a Chains object
        let chains: Chains = JSON.parse(data?.chains?.toString()!);
        
        // add the chain into chains class
        chains.addChain(chain);
        // update Metamask state with new chain state
        await snap.request({
            method: 'snap_manageState',
            params: { operation: 'update', newState: { chains: chains.string() } },
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
        // update Metamask state with new chain state
        await snap.request({
            method: 'snap_manageState',
            params: { operation: 'update', newState: { chains: chains.string() } },
        });
        return true
    }
    public static async removeChain(chain_id: string) {
        // get the current state of chains in Metamask we will add chain into
        const data = await snap.request({
            method: 'snap_manageState',
            params: { operation: 'get' },
        });
        // remember we keep chain stores as a json string so convert into a Chains object
        let chains: Chains = JSON.parse(data?.chains?.toString()!);
        let keepChains = chains.chains.filter(item => item.chain_id !== chain_id);
        // update chains
        chains.chains = keepChains;

        // update Metamask state with new chain state
        await snap.request({
            method: 'snap_manageState',
            params: { operation: 'update', newState: { chains: chains.string() } },
        });
    }
}