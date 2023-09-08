import type { Address } from '../../../snap/src/types/address';
import type { Chain, CosmosAddress } from '../../../snap/src/types/chains';
import { LOCAL_STORAGE_INIT } from './general';

export const snapId = import.meta.env.VITE_SNAP_ID ?? `local:http://localhost:8080`;
const snapVersion = import.meta.env.VITE_SNAP_VERSION;
const initialJsonString = "{}";
const installParams = JSON.parse(initialJsonString);
installParams[snapId] = { version: snapVersion };

declare global {
    interface Window {
        ethereum: any;
    }
}

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
  console.log(result);
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
      console.log(error);
    }
}