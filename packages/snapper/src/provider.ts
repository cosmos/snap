import { AccountData, ChainInfo, OfflineAminoSigner, OfflineDirectSigner } from '@keplr-wallet/types';
import { DirectSignResponse } from "@cosmjs/proto-signing";
import { AminoSignResponse, StdSignDoc } from "@cosmjs/amino";
import { Long } from 'long';
import { Address, Chain, CosmosAddress, Fees, Msg } from './types';
import { DeliverTxResponse } from "@cosmjs/stargate";
import { addAddressToBook, deleteAddressFromBook, deleteChain, getAccountInfo, getAddressBook, getBech32Address, getBech32Addresses, getChains, installSnap, isSnapInitialized, isSnapInstalled, sendTx, sign, signAmino, signAndBroadcast, signDirect, suggestChain } from './snap';
import { CosmJSOfflineSigner } from './signer';
import { SignDoc } from 'cosmjs-types/cosmos/tx/v1beta1/tx';

declare global {
  interface Window {
    cosmos: CosmosSnap,
    ethereum?: any
  }
}

export interface SnapProvider {
  experimentalSuggestChain(chainInfo: ChainInfo): Promise<void>;
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
  getOfflineSigner(chainId: string): Promise<OfflineAminoSigner & OfflineDirectSigner>;
  enabled(): Promise<boolean>;
  install(): Promise<void>;
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
    snap_id: string;
    changeSnapId(snap_id: string): void {
        this.snap_id = snap_id;
    }
    async getAccount(chain_id: string): Promise<AccountData> {
        let account = await getAccountInfo(chain_id, this.snap_id);
        return account
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
    async enabled(): Promise<boolean> {
        let installed = await isSnapInstalled(this.snap_id);
        let initialized = await isSnapInitialized(this.snap_id);
        return installed && initialized
    }
    async install(): Promise<void> {
        await installSnap(this.snap_id);
    }
    async getChains(): Promise<Chain[]> {
        let chains = await getChains(this.snap_id);
        return chains;
    }
    async experimentalSuggestChain(chainInfo: ChainInfo): Promise<void> {
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
                png: chainInfo.chainSymbolImageUrl,
                svg: chainInfo.chainSymbolImageUrl
            },
            apis: {
                rpc: [
                    {
                        address: chainInfo.rpc,
                        provider: chainInfo.nodeProvider.name
                    }
                ],
                rest: [
                    {
                        address: chainInfo.rest,
                        provider: chainInfo.nodeProvider.name
                    }
                ]
            },
            address: undefined
        }
        await suggestChain(chain, this.snap_id)
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
    async getOfflineSigner(chainId: string): Promise<OfflineAminoSigner & OfflineDirectSigner> {
        return new CosmJSOfflineSigner(chainId, this.snap_id);
    }
}