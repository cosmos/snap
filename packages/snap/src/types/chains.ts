export interface Chain {
    chain_name: string;
    chain_id: string;
    pretty_name: string;
    // Coin type
    slip44: string;
    // Address prefix
    bech32_prefix: string;
    fees: Fees;
    staking: Staking,
    logo_URIs: Logos,
    apis: {
        "rpc": Api[];
        "rest": Api[];
        "grpc": Api[];
    },
    explorers: Explorer[];
}

export interface Explorer {
    kind: string;
    url: string;
    tx_page: string;
    account_page: string;
}

export interface Api {
    address: string;
    provider: string;
}

export interface Staking {
    staking_tokens: {
        denom: string
    }
}

export interface Fees {
    fee_tokens: FeeToken[]
}

export interface Logos {
    png: string;
    svg: string;
}

export interface FeeToken {
    denom: string;
    fixed_min_gas_price: number;
    low_gas_price: number;
    average_gas_price: number;
    high_gas_price: number;
}

export interface Gas {
    default: number;
    denom: string;
}

export class Chains {
    constructor(chains: Chain[]) {
        this.chains = chains
    };

    chains: Chain[];

    addChain(chain: Chain) {
        this.chains.push(chain)
    };

    /**
     * Turn all chains into a JSON string using JSON stringify.
     *
     * @returns Stringified JSON of chains.
     * @throws If an error occurs.
     */
    string() {
        return JSON.stringify(this.chains)
    };
}