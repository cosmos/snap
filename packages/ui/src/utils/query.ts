import { StargateClient, type Coin } from "@cosmjs/stargate"

export interface ChainBalances {
    chain_id: string;
    balances: readonly Coin[];
}

export const queryBalances = async (rpcEndpoint: string, targetAddress: string, chain_id: string): Promise<ChainBalances> => {
    const client = await StargateClient.connect(rpcEndpoint);

    const balance = await client.getAllBalances(targetAddress);

    return { chain_id, balances: balance };
};

export const queryBalance = async (rpcEndpoint: string, targetAddress: string, denom: string): Promise<Coin> => {
    const client = await StargateClient.connect(rpcEndpoint);

    const balance = await client.getBalance(targetAddress, denom);

    return balance;
};