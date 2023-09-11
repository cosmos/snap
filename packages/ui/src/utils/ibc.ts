import type { Coin, HttpEndpoint } from "@cosmjs/stargate";
import type { Chain } from "@cosmsnap/snapper";

export interface Route {
  source_asset_denom: string;
  source_asset_chain_id: string;
  dest_asset_denom: string; 
  dest_asset_chain_id: string;
  amount_in: string;
  amount_out?: string;
  operations: Operation[];
  chain_ids: string[];
  does_swap?: boolean;
  estimated_amount_out?: string;
  swap_venue?: {
    name: string;
    chain_id: string;
  };
  txs_required?: number;
}

interface Operation {
  transfer?: {
    port: string;
    channel: string;
    chain_id: string;
    pfm_enabled: boolean;
    dest_denom: string;
    supports_memo: boolean;
  };
  swap?: {
    swap_in: {
      swap_venue: {
        name: string;
        chain_id: string; 
      };
      swap_operations: SwapOperation[];
      swap_amount_in: string;
    };
    estimated_affiliate_fee?: string;
  };
}

interface SwapOperation {
  pool: string;
  denom_in: string;
  denom_out: string;
}

interface RecommendationsResponse {
  recommendations: Recommendation[]; 
}

interface Recommendation {
  asset: {
    denom: string;
    chain_id: string;
    origin_denom: string;
    origin_chain_id: string; 
    trace: string;
  };
  reason: string;
}

export interface SkipMsg {
  chain_id: string;
  path: string[];
  msg: string;
  msg_type_url: string;
}

export interface SkipMsgs {
  msgs: SkipMsg[]; 
}

export interface CoinIBC extends Coin {
  ibc: boolean;
  ibc_denom?: string;
  display: string;
}

export interface IbcAsset {
  denom: string;
  chain_id: string;
  origin_denom: string;
  origin_chain_id: string;
  trace: string;
  symbol: string;
  name: string; 
  logo_uri: string;
  decimals: number;
}

export interface ChainToAssetsMap {
  assets: IbcAsset[];
}

export interface AllAssets {
  chain_to_assets_map: {
    [chainId: string]: ChainToAssetsMap 
  };
}

export const getRoute = async (
    amount_in: string, 
    source_asset_denom: string, 
    source_asset_chain_id: string,
    dest_asset_denom: string,
    dest_asset_chain_id: string,
): Promise<Route> => {

    try {

        const url = 'https://api.skip.money/v1/fungible/route';

        const data = {
            amount_in,
            source_asset_denom, 
            source_asset_chain_id,
            dest_asset_denom,
            dest_asset_chain_id,
            cumulative_affiliate_fee_bps: '0',
            client_id: 'cosmsnap'
        };
        
        let res = fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)  
        });

        let resData = (await res).json();

        return resData
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export const getSkipRecommendation = async (
    source_asset_denom: string, 
    source_asset_chain_id: string,
    dest_chain_id: string,
): Promise<RecommendationsResponse> => {

    try {

        const url = 'https://api.skip.money/v1/fungible/recommend_assets';

        const data = {
            source_asset_denom, 
            source_asset_chain_id,
            dest_chain_id,
            client_id: 'cosmsnap'
        };
        
        let res = fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)  
        });

        let resData = (await res).json();

        return resData
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export const getMsgs = async (
  sourceChainId: string,
  sourceAsset: string,
  destChainId: string, 
  destAsset: string,
  amount: string,
  slippageTolerance: string,
  chains: Chain[],
  toAddress: string
): Promise<SkipMsgs> => {

  const url = 'https://api.skip.money/v1/fungible/msgs_direct';

  let chain_ids_to_addresses: Record<string, string> = {};
  chains.map(item => {
    if (item.address) {
      if (item.chain_id == destChainId) {
        chain_ids_to_addresses[item.chain_id] = toAddress
      } else {
        chain_ids_to_addresses[item.chain_id] = item.address
      }
    }
  })

  const body = {
    chain_ids_to_addresses,
    source_asset_denom: sourceAsset,
    dest_asset_denom: destAsset,
    dest_asset_chain_id: destChainId,
    source_asset_chain_id: sourceChainId,
    amount_in: amount,
    slippage_tolerance_percent: slippageTolerance
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  let data = await res.json();
  
  return data;
}

export const getDenomFromIBC = async (url: string | HttpEndpoint, ibc_coin: Coin): Promise<Coin | CoinIBC> => {
  let splits = ibc_coin.denom.toUpperCase().split("IBC/");
  if (splits.length > 1) {
    let hash = splits[1];
    let res = await fetch(`${url}/ibc/apps/transfer/v1/denom_traces/${hash}`);
    let data = await res.json();
    return {
      denom: data.denom_trace.base_denom,
      amount: ibc_coin.amount
    }
  }
  return ibc_coin
}

export const getAssets = async (chain_id: string): Promise<AllAssets> => {
  const url = `https://api.skip.money/v1/fungible/assets?chain_id=${chain_id}&include_no_metadata_assets=false`;
  
  const response = await fetch(url, {
    method: 'GET', 
    headers: {
      'Accept': 'application/json'
    }
  });
  
  const assets = await response.json();
  
  return assets;
}