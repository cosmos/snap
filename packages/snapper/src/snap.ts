import { Address, Chain, CosmosAddress, Fees, Msg } from './types';
import { StdSignDoc, AminoSignResponse } from "@cosmjs/amino";
import { DirectSignResponse } from '@cosmjs/proto-signing';
import { DeliverTxResponse } from "@cosmjs/stargate";
import { AccountData } from '@cosmjs/amino';
import { SignDoc } from 'cosmjs-types/cosmos/tx/v1beta1/tx';

export const DEFAULT_SNAP_ID = "npm:@cosmsnap/snap";

export const isSnapInstalled = async (snapId = DEFAULT_SNAP_ID) => {
    let result = await window.ethereum.request({ method: 'wallet_getSnaps' });
    const installed = Object.keys(result).includes(snapId);

    return installed
}

export const isSnapInitialized = async (snapId = DEFAULT_SNAP_ID): Promise<boolean> => {
    const initialized = await window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
            snapId: snapId,
            request: {
                method: 'initialized',
            },
        },
    });

    return initialized
}

export const installSnap = async (snapId = DEFAULT_SNAP_ID) => {
    let installed = await isSnapInstalled();
    if (!installed) {
        await window.ethereum.request({
            method: 'wallet_requestSnaps',
            params: {
                [snapId]: {
                    version: '^0.1.0',
                },
            },
        });
    }
    let initialized = await isSnapInitialized();
    if (!initialized) {
        await window.ethereum.request({
            method: 'wallet_invokeSnap',
            params: {
                snapId,
                request: {
                    method: 'initialize',
                },
            },
        });
    };
}

export const suggestChain = async (chainInfo: Chain, snapId = DEFAULT_SNAP_ID) => {
    await window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
            snapId,
            request: {
                method: 'addChain',
                params: {
                    chain_info: JSON.stringify(chainInfo),
                }
            },
        },
    });
}

export const getChains = async (snapId = DEFAULT_SNAP_ID): Promise<Chain[]> => {
    const result = await window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
            snapId,
            request: {
                method: 'getChains'
            },
        },
    });

    return result.data.chains
}

export const deleteChain = async (chain_id: string, snapId = DEFAULT_SNAP_ID) => {
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
        },
    });
}

export const signAndBroadcast = async (chain_id: string, msgs: Msg[], fees: Fees, snapId = DEFAULT_SNAP_ID): Promise<DeliverTxResponse> => {
    let result = await window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
            snapId,
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

export const sign = async (chain_id: string, msgs: Msg[], fees: Fees, snapId = DEFAULT_SNAP_ID): Promise<Int8Array> => {
    let result = await window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
            snapId,
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

export const addAddressToBook = async (chain_id: string, address: string, name: string, snapId = DEFAULT_SNAP_ID) => {
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
}

export const getAddressBook = async (snapId = DEFAULT_SNAP_ID): Promise<Address[]> => {
    const result = await window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
            snapId,
            request: {
                method: 'getAddresses'
            },
        },
    });

    return result.data
}

export const deleteAddressFromBook = async (address: string, snapId = DEFAULT_SNAP_ID) => {
    await window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
            snapId,
            request: {
                method: 'deleteAddress',
                params: {
                    address
                }
            },
        },
    });
}

export const getBech32Addresses = async (snapId = DEFAULT_SNAP_ID): Promise<CosmosAddress[]> => {
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

export const getBech32Address = async (chain_id: string, snapId = DEFAULT_SNAP_ID): Promise<CosmosAddress> => {
    const result = await window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
            snapId,
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

export const getAccountInfo = async (chain_id: string, snapId = DEFAULT_SNAP_ID): Promise<AccountData> => {
    const result = await window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
            snapId,
            request: {
                method: 'getAccountInfo',
                params: {
                    chain_id,
                }
            },
        },
    });
    return result.data;
};

export const sendTx = async (chain_id: string, tx: Uint8Array, snapId = DEFAULT_SNAP_ID): Promise<DeliverTxResponse> => {
    const result = await window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
            snapId,
            request: {
                method: 'sendTx',
                params: {
                    chain_id,
                    tx,
                }
            },
        },
    });
    return result.data;
};

export const signDirect = async (
    chain_id: string,
    signer: string,
    sign_doc: SignDoc,
    snapId = DEFAULT_SNAP_ID
): Promise<DirectSignResponse> => {
    const result = await window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
            snapId,
            request: {
                method: 'signDirect',
                params: {
                    chain_id,
                    sign_doc,
                    signer
                }
            },
        },
    });
    return result.data;
};

export const signAmino = async (
    chain_id: string,
    signer: string,
    sign_doc: StdSignDoc,
    snapId = DEFAULT_SNAP_ID
): Promise<AminoSignResponse> => {
    const result = await window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
            snapId,
            request: {
                method: 'signAmino',
                params: {
                    chain_id,
                    sign_doc,
                    signer
                }
            },
        },
    });
    return result.data;
};