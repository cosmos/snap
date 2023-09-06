import { StargateClient } from "@cosmjs/stargate";
import type { Chain } from "../../../snap/src/types/chains";
import { getChainAddresses, getChains } from "./snap";

export interface ChainClient extends Chain {
    client: StargateClient | null;
}

export const createClient = async (chain: Chain, address: string): Promise<ChainClient> => {
    let newChain: ChainClient = {
        ...chain,
        address,
        client: await StargateClient.connect(chain.apis.rpc[0].address)
    };
    return newChain;
};

export const createAllChains = async (): Promise<(ChainClient | null)[]> => {
    
    const [chains, addresses] = await Promise.all([getChains(), getChainAddresses()]);

    // Map over each chain, but make each promise "safe" by catching errors.
    const clientPromises = chains.map(async (chain) => {
        try {
            const address = addresses.find(address => address.chain_id === chain.chain_id)?.address;
            if (address) {
                return await createClient(chain, address);
            } else {
                console.error(`No address found for chain ${chain.chain_id}`);
                return null;
            }
        } catch (err) {
            console.error(err);
            return null;
        }
    });

    // Wait for all "safe" promises to resolve.
    const clients = await Promise.all(clientPromises);
    
    return clients;
};