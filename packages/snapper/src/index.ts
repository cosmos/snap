import { Address, Chain, CosmosAddress, Fees, Msg } from './types';
import { DeliverTxResponse } from "@cosmjs/stargate";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const isSnapInstalled = async () => {
    let result = await window.ethereum.request({ method: 'wallet_getSnaps' });
    const installed = Object.keys(result).includes("npm:@cosmsnap/snap");

    return installed
}

export const isSnapInitialized = async (): Promise<boolean> => {
    const initialized = await window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
            snapId: 'npm:@cosmsnap/snap',
            request: {
                method: 'initialized',
            },
        },
    });

    return initialized
}

export const installSnap = async () => {
    await window.ethereum.request({
        method: 'wallet_requestSnaps',
        params: {
            'npm:@cosmsnap/snap': {
            version: '^0.1.0',
            },
        },
    });

    await window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
            snapId: 'npm:@cosmsnap/snap',
            request: {
                method: 'initialize',
            },
        },
    });
}

export const suggestChain = async (chainInfo: Chain) => {
    await window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
            snapId: 'npm:@cosmsnap/snap',
            request: {
                method: 'addChain',
                params: {
                    chain_info: JSON.stringify(chainInfo),
                }
            },
        },
    });
}

export const getChains = async (): Promise<Chain[]> => {
    const result = await window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
            snapId: 'npm:@cosmsnap/snap',
            request: {
                method: 'getChains'
            },
        },
    });

    return result.data.chains
}

export const deleteChain = async (chain_id: string) => {
    await window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
            snapId: 'npm:@cosmsnap/snap',
            request: {
                method: 'deleteChain',
                params: {
                    chain_id,
                }
            },
        },
    });
}

export const signAndBroadcast = async (chain_id: string, msgs: Msg[], fees: Fees): Promise<DeliverTxResponse> => {
    let result = await window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
            snapId: 'npm:@cosmsnap/snap',
            request: {
                method: 'transact',
                params: {
                    chain_id,
                    msgs: JSON.stringify(msgs),
                    // Optional: Uses default fees for chain if not specified
                    fees: fees ? JSON.stringify(fees) : null
                }
            },
        },
    });

    return result.data
}

export const sign = async (chain_id: string, msgs: Msg[], fees: Fees): Promise<Int8Array> => {
    let result = await window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
            snapId: 'npm:@cosmsnap/snap',
            request: {
                method: 'signTx',
                params: {
                    chain_id,
                    msgs: JSON.stringify(msgs),
                    // Optional: Uses default fees for chain if not specified
                    fees: fees ? JSON.stringify(fees) : null
                }
            },
        },
    });

    return result.data
}

export const addAddressToBook = async (chain_id: string, address: string, name: string) => {
    await window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
            snapId: 'npm:@cosmsnap/snap',
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
}

export const getAddressBook = async (): Promise<Address[]> => {
    const result = await window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
            snapId: 'npm:@cosmsnap/snap',
            request: {
                method: 'getAddresses'
            },
        },
    });

    return result.data
}

export const deleteAddressFromBook = async (address: string) => {
    await window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
            snapId: 'npm:@cosmsnap/snap',
            request: {
                method: 'deleteAddress',
                params: {
                    address
                }
            },
        },
    });
}

export const getBech32Addresses = async (): Promise<CosmosAddress[]> => {
  const result = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: 'npm:@cosmsnap/snap',
      request: {
        method: 'getChainAddresses',
      },
    },
  });
  return result.data.addresses;
};

export const getBech32Address = async (chain_id: string): Promise<CosmosAddress> => {
    const result = await window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
            snapId: 'npm:@cosmsnap/snap',
            request: {
                method: 'getChainAddress',
                params: {
                    chain_id,
                }
            },
        },
    });
    return result.data;
  };