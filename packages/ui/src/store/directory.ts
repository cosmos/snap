import { writable } from 'svelte/store';

interface ApiInfo {
  address: string;
  provider: string;
}

interface ExplorerInfo {
  kind: string;
  url: string;
  tx_page?: string;
  account_page?: string;
}

interface ParamsStaking {
  unbonding_time: string;
  max_validators: number;
  max_entries: number;
  historical_entries: number;
  bond_denom: string;
}

interface ParamsSlashing {
  signed_blocks_window: string;
  min_signed_per_window: string;
  downtime_jail_duration: string;
  slash_fraction_double_sign: string;
  slash_fraction_downtime: string;
}

interface ParamsMint {
  mint_denom: string;
  inflation_rate_change: string;
  inflation_max: string;
  inflation_min: string;
  goal_bonded: string;
  blocks_per_year: string;
}

interface ParamsDistribution {
  community_tax: string;
  base_proposer_reward: string;
  bonus_proposer_reward: string;
  withdraw_addr_enabled: boolean;
}

interface Params {
  authz: boolean;
  actual_block_time: number;
  actual_blocks_per_year: number;
  unbonding_time: number;
  max_validators: number;
  blocks_per_year: number;
  block_time: number;
  community_tax: number;
  base_inflation: number;
  estimated_apr: number;
  calculated_apr: number;
  staking: ParamsStaking;
  slashing: ParamsSlashing;
  mint: ParamsMint;
  distribution: ParamsDistribution;
  current_block_height: string;
  bonded_ratio: number;
  bonded_tokens: string;
  total_supply: string;
  annual_provision: string;
}

interface StakingRewardsService {
  name: string;
  symbol: string;
  slug: string;
}

interface AssetPrice {
  usd: number;
}

interface Asset {
  name: string;
  description: string;
  symbol: string;
  denom: string;
  decimals: number;
  base: {
    denom: string;
    exponent: number;
  };
  display: {
    denom: string;
    exponent: number;
  };
  denom_units: Array<{
    denom: string;
    exponent: number;
  }>;
  logo_URIs?: {
    png: string;
    svg: string;
  };
  image: string;
  prices: {
    coingecko: {
      [key: string]: AssetPrice;
    };
  };
}

export interface ChainDirectory {
  name: string;
  path: string;
  chain_name: string;
  network_type: string;
  pretty_name: string;
  chain_id: string;
  status: string;
  bech32_prefix: string;
  slip44: number;
  symbol: string;
  display: string;
  denom: string;
  decimals: number;
  coingecko_id: string;
  image: string;
  website: string;
  height: number;
  best_apis: {
    rest: ApiInfo[];
    rpc: ApiInfo[];
  };
  proxy_status: {
    rest: boolean;
    rpc: boolean;
  };
  versions: {
    application_version: string;
    cosmos_sdk_version: string;
    tendermint_version: string;
  };
  explorers: ExplorerInfo[];
  params: Params;
  services: {
    staking_rewards: StakingRewardsService;
  };
  prices: {
    coingecko: {
      [key: string]: AssetPrice;
    };
  };
  assets: Asset[];
}

export const directory = writable<ChainDirectory[]>([]);

export async function updateDirectory() {
  try {
    const res = await fetch('https://chains.cosmos.directory/');
    if (res.ok) {
      const data = await res.json();
      directory.set(data.chains);
    } else {
      console.error('Failed to fetch data: ', res.json());
    }
  } catch (error) {
    console.error(error);
  }
}
