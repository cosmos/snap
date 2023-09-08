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