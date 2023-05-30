export interface Chain {
    chain_id: string;
    name: string;
    rpc: string;
    coin_type: string;
    // Address prefix
    prefix: string;
    gas: Gas;
}

export interface Gas {
    default: number;
    denom: string;
}

export interface Chains {
    chains: Chain[];
}