export interface Chain {
    id: string;
    name: string;
    rpc: string;
    coin_type: string;
}

export interface Chains {
    chains: Chain[];
}