import { AccountData, ChainInfo, Key, OfflineAminoSigner, OfflineDirectSigner } from '@keplr-wallet/types';
import { DirectSignResponse } from "@cosmjs/proto-signing";
import { AminoSignResponse, StdSignDoc } from "@cosmjs/amino";
import { Long } from 'long';
import { Address, Chain, CosmosAddress, Fees, Msg } from './types';
import { DeliverTxResponse } from "@cosmjs/stargate";
import { DEFAULT_SNAP_ID, addAddressToBook, deleteAddressFromBook, deleteChain, getAccountInfo, getAddressBook, getBech32Address, getBech32Addresses, getChains, getKey, installSnap, isSnapInitialized, isSnapInstalled, sendTx, sign, signAmino, signAndBroadcast, signDirect, suggestChain } from './snap.js';
import { CosmJSOfflineSigner } from './signer.js';
import { SignDoc } from 'cosmjs-types/cosmos/tx/v1beta1/tx';

declare global {
  interface Window {
    cosmos: CosmosSnap,
    ethereum?: any
  }
}

export interface SnapProvider {
  experimentalSuggestChain(chainInfo: ChainInfo): Promise<boolean>;
  signAmino(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc,
  ): Promise<AminoSignResponse>;
  signDirect(
    chainId: string,
    signer: string,
    signDoc: {
      /** SignDoc bodyBytes */
      bodyBytes?: Uint8Array | null;

      /** SignDoc authInfoBytes */
      authInfoBytes?: Uint8Array | null;

      /** SignDoc chainId */
      chainId?: string | null;

      /** SignDoc accountNumber */
      accountNumber?: Long | null;
    },
  ): Promise<DirectSignResponse>;
  sendTx(
    chainId: string,
    tx: Uint8Array,
  ): Promise<DeliverTxResponse>;
  getOfflineSigner(chainId: string, mode: string): OfflineAminoSigner & OfflineDirectSigner;
  getKey(chainId: string): Promise<Key>
  enable(): Promise<boolean>;
  getChains(): Promise<Chain[]>;
  deleteChain(chain_id: string): Promise<void>;
  signAndBroadcast(chain_id: string, msgs: Msg[], fees: Fees): Promise<DeliverTxResponse>;
  sign(chain_id: string, msgs: Msg[], fees: Fees): Promise<Int8Array>;
  addAddressToBook(chain_id: string, address: string, name: string): Promise<void>;
  getAddressBook(): Promise<Address[]>;
  deleteAddressFromBook(address: string): Promise<void>;
  getBech32Addresses(): Promise<CosmosAddress[]>;
  getBech32Address(chain_id: string): Promise<CosmosAddress>;
  getAccount(chain_id: string): Promise<AccountData>;
  changeSnapId(snap_id: string): void;
}

export class CosmosSnap implements SnapProvider {
    snap_id: string = DEFAULT_SNAP_ID;
    changeSnapId(snap_id: string): void {
        this.snap_id = snap_id;
    }
    async getAccount(chain_id: string): Promise<AccountData> {
        let account = await getAccountInfo(chain_id, this.snap_id);
        return account
    }
    async getKey(chain_id: string): Promise<Key> {
        let key = await getKey(chain_id, this.snap_id);
        return key
    }
    async deleteChain(chain_id: string): Promise<void> {
        await deleteChain(chain_id, this.snap_id);
    }
    async signAndBroadcast(chain_id: string, msgs: Msg[], fees: Fees): Promise<DeliverTxResponse> {
        let res = await signAndBroadcast(chain_id, msgs, fees, this.snap_id);
        return res;
    }
    async sign(chain_id: string, msgs: Msg[], fees: Fees): Promise<Int8Array> {
        let res = sign(chain_id, msgs, fees, this.snap_id);
        return res;
    }
    async addAddressToBook(chain_id: string, address: string, name: string): Promise<void> {
        await addAddressToBook(chain_id, address, name, this.snap_id);
    }
    async getAddressBook(): Promise<Address[]> {
        let addresses = await getAddressBook(this.snap_id);
        return addresses;
    }
    async deleteAddressFromBook(address: string): Promise<void> {
        await deleteAddressFromBook(address, this.snap_id);
    }
    async getBech32Addresses(): Promise<CosmosAddress[]> {
        let addresses = getBech32Addresses(this.snap_id);
        return addresses;
    }
    async getBech32Address(chain_id: string): Promise<CosmosAddress> {
        let address = getBech32Address(chain_id, this.snap_id);
        return address;
    }
    async enable(): Promise<boolean> {
        await installSnap(this.snap_id);
        return true;
    }
    async getChains(): Promise<Chain[]> {
        let chains = await getChains(this.snap_id);
        return chains;
    }
    async experimentalSuggestChain(chainInfo: ChainInfo): Promise<boolean> {
        let chains = await this.getChains();
        let chainIds = chains.map(item => item.chain_id);
        if (chainIds.includes(chainInfo.chainId)) {
            return true
        }
        let chain: Chain = {
            pretty_name: chainInfo.chainName,
            chain_name: chainInfo.chainName,
            chain_id: chainInfo.chainId,
            slip44: chainInfo.bip44.coinType,
            bech32_prefix: chainInfo.bech32Config.bech32PrefixAccAddr,
            fees: {
                fee_tokens: chainInfo.feeCurrencies.map(item => {
                    return {
                        denom: item.coinDenom,
                        low_gas_price: item.gasPriceStep.low,
                        average_gas_price: item.gasPriceStep.high,
                        high_gas_price: item.gasPriceStep.high,
                    }
                })
            },
            staking: {
                staking_tokens: [
                    { denom: chainInfo.stakeCurrency.coinDenom }
                ]
            },
            logo_URIs: {
                png: chainInfo.chainSymbolImageUrl ?? undefined,
                svg: chainInfo.chainSymbolImageUrl ?? undefined
            },
            apis: {
                rpc: [
                    {
                        address: chainInfo.rpc,
                    }
                ],
                rest: [
                    {
                        address: chainInfo.rest,
                    }
                ]
            },
            address: undefined
        }
        await suggestChain(chain, this.snap_id)
        return true;
    }
    async signAmino(chainId: string, signer: string, signDoc: StdSignDoc): Promise<AminoSignResponse> {
        let res = await signAmino(chainId, signer, signDoc, this.snap_id);
        return res
    }
    async signDirect(chainId: string, signer: string, signDoc: SignDoc): Promise<DirectSignResponse> {
        let res = await signDirect(chainId, signer, signDoc, this.snap_id);
        return res;
    }
    async sendTx(chainId: string, tx: Uint8Array): Promise<DeliverTxResponse> {
        let res = await sendTx(chainId, tx, this.snap_id);
        return res
    }
    getOfflineSigner(chainId: string, mode = 'direct'): OfflineAminoSigner & OfflineDirectSigner {
        if (mode == 'amino') {
            let signer = new CosmJSOfflineSigner(chainId, this.snap_id);
            signer.signDirect = undefined;
            return signer
        } else {
            let signer = new CosmJSOfflineSigner(chainId, this.snap_id);
            signer.signAmino = undefined;
            return signer
        }
    }
}