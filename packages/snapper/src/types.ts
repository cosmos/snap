import { HttpEndpoint } from "@cosmjs/stargate";

export interface Chain {
  chain_name: string;
  chain_id: string;
  pretty_name: string;
  // Coin type
  slip44: number;
  // Address prefix
  bech32_prefix: string;
  fees: ChainFees;
  staking?: Staking;
  logo_URIs?: Logos;
  apis: {
    rpc: Api[];
    rest: Api[];
    grpc?: Api[];
  };
  explorers?: Explorer[];
  address: string | undefined;
}

export interface Explorer {
  kind: string;
  url: string;
  tx_page?: string;
  account_page?: string;
}

export interface Api {
  address: string | HttpEndpoint;
  provider?: string;
}

export interface Staking {
  staking_tokens: {
    denom: string;
  }[];
}

export interface ChainFees {
  fee_tokens: FeeToken[];
}

export interface Logos {
  png: string;
  svg: string;
}

export interface FeeToken {
  denom: string;
  fixed_min_gas_price?: number;
  low_gas_price: number;
  average_gas_price: number;
  high_gas_price: number;
}

export interface Gas {
  default: number;
  denom: string;
}

export interface CosmosAddress {
  chain_id: string;
  address: string;
}

export interface Amount {
  denom: string;
  amount: string;
}

export interface Fees {
  amount: Amount[];
  gas: string;
}

export interface Msg {
  typeUrl: string,
  value: Object
}

export interface Address {
  name: string;
  address: string;
  chain_id: string;
}

export interface CosmosAddress {
  chain_id: string;
  address: string;
}