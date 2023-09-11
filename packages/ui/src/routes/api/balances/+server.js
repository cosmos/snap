import { json } from '@sveltejs/kit';

const getDenomFromIBC = async (/** @type {string | import("@cosmjs/stargate").HttpEndpoint} */ url, /** @type {import("@cosmjs/stargate").Coin} */ ibc_coin) => {
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

export async function POST({ request }) {
    
  let { chains } = await request.json();
  console.log(chains);

  /**
   * Fetches the balance for a given chain.
   * 
   * @param {import('../../../../../snap/src/types/chains').Chain} chain - The chain for which to fetch the balance.
   * @returns {Promise<Object>} - A promise resolving to an object containing the chain and its balance.
   */
  const fetchBalance = async (chain) => {
    try {
      const url = `${chain.apis.rest[0].address}/cosmos/bank/v1beta1/balances/${chain.address}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.balances.length == 0) {
        data.balances.push({
          amount: "0",
          denom: chain.staking?.staking_tokens[0].denom
        })
      }
      let cleansedBalances = data.balances.map((/** @type {import('@cosmjs/stargate').Coin} */ item) => getDenomFromIBC(chain.apis.rest[0].address, item));
      data.balances = await Promise.all(cleansedBalances);
      return { ...chain, balances: data.balances };
    } catch (err) {
      console.error(err);
      return { ...chain, balances: [] };
    }
  };

  try {
    // Fetch balances for all chains.
    const balances = await Promise.all(chains.map(fetchBalance));
    return json({
      status: 200,
      balances,
      error: null
    });
  } catch (error) {
    console.error(error);
    return json({
      status: 500,
      balances: null,
      error
    });
  }
}