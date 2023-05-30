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