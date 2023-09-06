import { json } from '@sveltejs/kit';

export async function POST({ request }) {
    
  let { chains } = await request.json();

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
      body: { balances }
    });
  } catch (error) {
    console.error(error);
    return json({
      status: 500,
      body: { error }
    });
  }
}