import { getChainAddresses, getChains, snapId } from './snap';
import { queryBalances } from './query';
import type { ChainBalances } from './query';
 
export const getAllBalances = async (): Promise<ChainBalances[]> => {
    let addressesP = getChainAddresses();

    let chainsP = getChains();

    let [addresses, chains] = await Promise.all([addressesP, chainsP]);    

    let balancesP = chains.map(chain => queryBalances(chain.apis.rpc[0].address, addresses.filter(item => item.chain_id === chain.chain_id)[0].address, chain.chain_id));

    let balances = Promise.all(balancesP);
    
    return balances
};