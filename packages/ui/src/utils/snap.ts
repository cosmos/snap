import type { Address } from '../../../snap/src/types/address';
import type { Chain, CosmosAddress } from '../../../snap/src/types/chains';
import { LOCAL_STORAGE_INIT } from './general';
import type { ChainInfo } from '@keplr-wallet/types';

declare global {
  interface Window {
    ethereum?: any
  }
}

export const snapId = import.meta.env.VITE_SNAP_ID ?? `npm:@cosmsnap/snap`;
const initialJsonString = "{}";
const snapVersion = import.meta.env.VITE_SNAP_VERSION;
const installParams = JSON.parse(initialJsonString);
installParams[snapId] = { version: snapVersion };

export const isMetaMaskInstalled = (): boolean | undefined => !!window.ethereum && window.ethereum.isMetaMask;

export const isSnapInstalled = async (): Promise<boolean | undefined> => {
  const result = await window.ethereum.request({ method: 'wallet_getSnaps' });
  return Object.keys(result).includes(snapId);
};

export const isSnapInitialized = async (): Promise<boolean | undefined> => {
  const result = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId,
      request: {
        method: 'initialized',
      },
    },
  });
  return result.data.initialized;
};

export const getChains = async (): Promise<Chain[]> => {
  const result = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId,
      request: {
        method: 'getChains',
      },
    },
  });
  return result.data.chains;
};

export const getChainAddresses = async (): Promise<CosmosAddress[]> => {
  const result = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId,
      request: {
        method: 'getChainAddresses',
      },
    },
  });
  return result.data.addresses;
};

export const getPublicKey = async (): Promise<string> => {
  const result = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId,
      request: {
        method: 'getPublicKey',
      },
    },
  });
  return result.data.public_key;
};

export const getAddresses = async (): Promise<Address[]> => {
  const result = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId,
      request: {
        method: 'getAddresses',
      },
    },
  });
  return result.data;
};

export const addAddressToBook = async (chain_id: string, address: string, name: string) => {
  await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
        snapId,
        request: {
            method: 'addAddress',
            params: {
                chain_id,
                address,
                name
            }
        },
    },
  });
};

export const deleteChain = async (chain_id: string) => {
  await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId,
      request: {
          method: 'deleteChain',
          params: {
              chain_id,
          }
      },
    }
  })
};

export const installSnap = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_requestSnaps',
      params: installParams,
    });

  } catch (err) {
    console.error(err);
    throw err
  }
};

export const initSnap = async (): Promise<Chain[]> => {
  try {
    // save in local storage for cache
    localStorage.setItem(LOCAL_STORAGE_INIT, "true");
    let res = await window.ethereum.request({
      method: 'wallet_invokeSnap',
      params: {
        snapId,
        request: {
          method: 'initialize',
        },
      },
    });

    return res.data

  } catch (err) {
    console.error(err);
    throw err
  }
};

export const initialize = async () => {
  try {

    await installSnap();
    await initSnap();
    
    } catch (error) {
      console.error(error);
    }
}

// Convert ChainInfo to Chain
export const chainInfoToChain = (chainInfo: ChainInfo): Chain => {

  return {
    chain_name: chainInfo.chainName, 
    chain_id: chainInfo.chainId,
    pretty_name: chainInfo.chainName,
    slip44: chainInfo.bip44.coinType,
    bech32_prefix: chainInfo.bech32Config.bech32PrefixAccAddr,
    fees: {
      fee_tokens: chainInfo.feeCurrencies.map(currency => {
        return {
          denom: currency.coinDenom,
          low_gas_price: currency.gasPriceStep!.low,
          average_gas_price: currency.gasPriceStep!.average,
          high_gas_price: currency.gasPriceStep!.high
        }
      })
    },
    staking: {
      staking_tokens: [
        { denom: chainInfo.stakeCurrency.coinDenom }  
      ]
    },
    logo_URIs: chainInfo.chainSymbolImageUrl ? {
      png: chainInfo.chainSymbolImageUrl,
      svg: chainInfo.chainSymbolImageUrl
    } : undefined,
    apis: {
      rpc: [{
        address: chainInfo.rpc,
        provider: chainInfo.nodeProvider?.name
      }],
      rest: [{
        address: chainInfo.rest,
        provider: chainInfo.nodeProvider?.name  
      }]
    },
    address: undefined
  }
}

// Convert Chain to ChainInfo
export const chainToChainInfo = (chain: Chain): ChainInfo => {

  return {
    rpc: typeof chain.apis.rpc[0].address == "string" ? chain.apis.rpc[0].address: chain.apis.rpc[0].address.url,
    rest: typeof chain.apis.rpc[0].address == "string" ? chain.apis.rpc[0].address: chain.apis.rpc[0].address.url,
    nodeProvider: {
      name: chain.apis.rpc[0].provider ? chain.apis.rpc[0].provider: "",
      email: ""
    },
    chainId: chain.chain_id,
    chainName: chain.pretty_name,
    stakeCurrency: {
      coinDenom: chain.staking!.staking_tokens[0].denom.substring(1),
      coinMinimalDenom: chain.fees.fee_tokens[0].denom,
      coinDecimals: 8
    },
    bip44: {
      coinType: chain.slip44
    },
    bech32Config: {
      bech32PrefixAccAddr: chain.bech32_prefix,
      bech32PrefixAccPub: chain.bech32_prefix+"pub",
      bech32PrefixValAddr: chain.bech32_prefix+"valoper",
      bech32PrefixValPub: chain.bech32_prefix+"valoperpub",
      bech32PrefixConsAddr: chain.bech32_prefix+"valcons",
      bech32PrefixConsPub: chain.bech32_prefix+"valconspub"
    },
    feeCurrencies: chain.fees.fee_tokens.map(feeToken => {
      return {
        coinDenom: feeToken.denom.substring(1),
        gasPriceStep: {
          low: feeToken.low_gas_price,
          average: feeToken.average_gas_price,
          high: feeToken.high_gas_price
        },
        paths: [],
        originChainId: "",
        originCurrency: "",
        coinMinimalDenom: feeToken.denom,
        coinDecimals: 8
      }
    }),
    currencies: [],
    chainSymbolImageUrl: chain.logo_URIs?.svg
  }
}