import { ethers } from 'ethers';
import { Squid, type ChainData, type TokenData } from "@0xsquid/sdk";
import type { SkipChain, SkipToken } from './skip';
import rpcs from '../apis.json';
import { chain } from 'lodash';

export interface RouteChain {
    chain_name: string;
    chain_id: string;
    logo_uri: string;
    chain_type: string;
    rpc: string | undefined;
}

export interface RouteToken {
    denom: string;
    chain_id: string;
    ibc_denom?: string;
    origin_chain_id?: string;
    display: string;
    logo_uri: string;
    decimals: number;
}

export class Router {
    private signer!: ethers.Signer;
    private squid!: Squid;
  
    constructor() {
      if (window.ethereum) {
        (async () => {
            // This will prompt the user to connect their MetaMask wallet
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            // Now we create a provider using ethers that is connected to MetaMask
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            
            // We can now get the signer from the MetaMask connected provider
            this.signer = provider.getSigner();

            /////// Squid ////////
            this.squid = new Squid({
                baseUrl: "https://api.0xsquid.com"
            });

            await this.squid.init();
        })();
      } else {
        throw new Error('MetaMask is not installed and no Infura ID provided.');
      }
    }

    public async getChains(): Promise<RouteChain[]> {
        const res = await fetch("https://api.skip.money/v1/info/chains?include_evm=false");
        const skipChainsRaw = await res.json();
        const skipChains: SkipChain[] = skipChainsRaw["chains"];
        const squidChains = this.squid.chains;
        return [
            ...skipChains.map((chain: SkipChain) => {
                return {
                    chain_name: chain.chain_name.charAt(0).toUpperCase() + chain.chain_name.slice(1),
                    chain_id: chain.chain_id,
                    logo_uri: chain.logo_uri,
                    chain_type: chain.chain_type,
                    rpc: rpcs.apis.find(item => item.chain_id == chain.chain_id)?.rpc
                };
            }), 
            ...squidChains.map((chain: ChainData) => {
                return {
                    chain_name: chain.chainName.charAt(0).toUpperCase() + chain.chainName.slice(1),
                    chain_id: chain.chainId.toString(),
                    logo_uri: chain.chainIconURI,
                    chain_type: chain.chainType,
                    rpc: chain.rpc
                };
            })
        ].sort((chain) => chain.chain_type === "cosmos" ? 1 : -1).filter((chain) => chain.rpc !== undefined);
    }

    public async getTokens(chain_id: string): Promise<RouteToken[]> {
        const res = await fetch("https://api.skip.money/v1/fungible/assets?native_only=false&include_no_metadata_assets=false&include_cw20_assets=false&include_evm_assets=false");
        const skipTokensRaw = await res.json();
        const skipTokens = Object.values(skipTokensRaw.chain_to_assets_map)
        .map((chain: any) => chain.assets)
        .flat()
        .map(asset => ({
            denom: asset.denom,
            chain_id: asset.chain_id,
            origin_denom: asset.origin_denom,
            origin_chain_id: asset.origin_chain_id,
            trace: asset.trace,
            is_cw20: asset.is_cw20,
            is_evm: asset.is_evm,
            symbol: asset.symbol,
            name: asset.name,
            logo_uri: asset.logo_uri,
            decimals: asset.decimals,
        }));
        const squidTokens = this.squid.tokens;
        return [
            ...skipTokens.map((token: SkipToken) => {
                return {
                    denom: token.origin_denom,
                    chain_id: token.chain_id,
                    ibc_denom: token.denom,
                    origin_chain_id: token.origin_chain_id,
                    display: token.symbol,
                    logo_uri: token.logo_uri,
                    decimals: token.decimals
                };
            }), 
            ...squidTokens.map((token: TokenData) => {
                return {
                    denom: token.address,
                    chain_id: token.chainId.toString(),
                    ibc_denom: token.ibcDenom,
                    origin_chain_id: "",
                    display: token.symbol,
                    logo_uri: token.logoURI,
                    decimals: token.decimals
                };
            })
        ].filter(chain => chain.chain_id === chain_id);
    }

    public async route() {
        // Simple logic. If the swap is Cosmos -> Cosmos we use Skip. Any EVM involvement we use Squid.
    }

    private async squidRoute() {

    }

    private async skipRoute() {

    }
}