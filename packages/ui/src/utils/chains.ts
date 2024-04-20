import { StargateClient } from "@cosmjs/stargate";
import type { Chain } from "../../../snap/src/types/chains";

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