import { ethers } from 'ethers';
import { Squid, type ChainData, type TokenData, type RouteData, type TokenBalance } from "@0xsquid/sdk";
import { getMsgs, type SkipChain, type SkipToken, type SkipMsgs, type Fee } from './skip';
import rpcs from '../apis.json';
import { type DeliverTxResponse, type SigningStargateClient, coins } from '@cosmjs/stargate';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { toUtf8 } from '@cosmjs/encoding';
import type { EncodeObject } from '@cosmjs/proto-signing';
import { getClient } from './tx';
import type { Chain } from '@cosmsnap/snapper';
import _ from 'lodash';

export interface RouteChain {
    chain_name: string;
    chain_id: string;
    logo_uri: string;
    chain_type: "cosmos" | "evm";
    rpc: string | undefined;
}

export interface RouteToken {
    denom: string;
    chain_id: string;
    ibc_denom: string;
    origin_chain_id?: string;
    display: string;
    logo_uri: string;
    decimals: number;
}

export class Router {
    public squid!: Squid;
  
    constructor() {
        /////// Squid ////////
        this.squid = new Squid({
            baseUrl: "https://api.0xsquid.com"
        });
    }

    private async initSquid() {
        if (!this.squid.initialized) {
            await this.squid.init();
        }
    }

    private async getSigner(type: "cosmos" | "evm", chain: Chain | undefined = undefined) {
        if (type === "evm") {
            return await this.getEVMSigner();
        } else {
            if (chain === undefined) {
                throw new Error("Chain ID required for Cosmos signer.");
            }
            return await this.getCosmosSigner(chain);
        }
    }

    private async getCosmosSigner(chain: Chain): Promise<SigningStargateClient> {
        if (window.cosmos) {
            return await getClient(chain, "amino")
        } else {
            throw new Error('Cosmos signer not found.');
        }
    }

    private async getEVMSigner(): Promise<ethers.providers.JsonRpcSigner> {
        if (window.ethereum) {
            // This will prompt the user to connect their MetaMask wallet
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            // Now we create a provider using ethers that is connected to MetaMask
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            
            // We can now get the signer from the MetaMask connected provider
            const signer = provider.getSigner();

            return signer
        } else {
            throw new Error('Metamask signer not found.');
        }
    }

    public async getChains(cosmosChains: Chain[]): Promise<RouteChain[]> {
        await this.initSquid();
        const res = await fetch("https://api.skip.money/v1/info/chains?include_evm=false");
        const skipChainsRaw = await res.json();
        const skipChains: SkipChain[] = skipChainsRaw["chains"];
        const squidChains = this.squid.chains;
        let cosmChains: RouteChain[] = [];
        if (cosmosChains.length > 0) {
            cosmChains = cosmosChains.map((chain: Chain) => {
                return {
                    chain_name: chain.chain_name.charAt(0).toUpperCase() + chain.chain_name.slice(1),
                    chain_id: chain.chain_id,
                    logo_uri: 'logo_URIs' in chain ? chain.logo_URIs!.png : "/cosmos-atom-logo.png",
                    chain_type: "cosmos",
                    rpc: rpcs.apis.find(item => item.chain_id == chain.chain_id)?.rpc
                };
            })
        } else {
        cosmChains = skipChains.map((chain: SkipChain) => {
                return {
                    chain_name: chain.chain_name.charAt(0).toUpperCase() + chain.chain_name.slice(1),
                    chain_id: chain.chain_id,
                    logo_uri: chain.logo_uri,
                    chain_type: chain.chain_type as "cosmos" | "evm",
                    rpc: rpcs.apis.find(item => item.chain_id == chain.chain_id)?.rpc
                };
            })
        }
        const chains = [
            ...cosmChains,
            ...squidChains.map((chain: ChainData) => {
                return {
                    chain_name: chain.chainName.charAt(0).toUpperCase() + chain.chainName.slice(1),
                    chain_id: chain.chainId.toString(),
                    logo_uri: chain.chainIconURI,
                    chain_type: chain.chainType,
                    rpc: chain.rpc
                };
            }).filter(chain => chain.chain_type === "evm")
        ].sort((chain) => chain.chain_type === "cosmos" ? 1 : -1).filter((chain) => chain.rpc !== undefined);
        return chains
    }

    public async getEVMAddress() {
        const signer = await this.getEVMSigner();
        return await signer.getAddress();
    }

    public async convertEVMToChainType(fromChainEvm: ChainData | undefined): Promise<Chain> {
        return {
            address: await this.getEVMAddress(),
            chain_id: (fromChainEvm?.chainId ?? "").toString(),
            chain_name: fromChainEvm?.chainName ?? "",
            pretty_name: fromChainEvm?.chainName ?? "",
            logo_URIs: {
                png: fromChainEvm?.chainIconURI ?? "",
                svg: fromChainEvm?.chainIconURI ?? "",
            },
            slip44: 0,
            bech32_prefix: "0x",
            fees: {
                fee_tokens: []
            },
            apis: {
                rpc: [
                    {
                        address: fromChainEvm?.rpc ?? "",
                    }
                ],
                rest: [
                    {
                        address: fromChainEvm?.rpc ?? "",
                    }
                ],
            }
        }
    }

    public async getTokens(chain_id: string): Promise<RouteToken[]> {
        await this.initSquid();
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
        let tokens = [
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
                    ibc_denom: token.ibcDenom ?? token.address,
                    origin_chain_id: "",
                    display: token.symbol,
                    logo_uri: token.logoURI,
                    decimals: token.decimals
                };
            })
        ].filter(chain => chain.chain_id === chain_id);
        return _.uniqBy(_.uniqBy(tokens, 'denom'), "ibc_denom");
    }

    public async execute(fromChain: RouteChain, toChain: RouteChain, route: SkipMsgs | RouteData, fromAddress: string, chain: Chain) {
        if (fromChain.chain_type === "evm" || toChain.chain_type === "evm") {
            return await this.squidExecute(
                route as RouteData,
                fromChain.chain_type,
                chain
            )
        }

        return await this.skipExecute(
            route as SkipMsgs,
            fromAddress,
            chain
        );
    }

    public async getEvmBalance(chain_id: string, denom: string): Promise<TokenBalance | undefined> {
        await this.initSquid();
        const signer = await this.getEVMSigner();
        const address = await signer.getAddress();
        const chains = [
            "1",
            "56",
            "137",
            "43114",
            "42161",
            "10",
            "8453",
            "59144",
            "5000",
            "534352",
            "250",
            "1284",
            "42220",
            "314",
            "2222"
        ]
        const balances = await this.squid.getAllEvmBalances({ userAddress: address, chains });
        return balances.find(balance => balance.chainId.toString() === chain_id && balance.address == denom);
    }

    public async route(fromChain: RouteChain, toChain: RouteChain, fromToken: RouteToken, toToken: RouteToken, amount: string, toAddress: string, fromAddress: string, slippage: number = 1.00, chains: Chain[]) {
        // Simple logic. If the swap is Cosmos -> Cosmos we use Skip. Any EVM involvement we use Squid.
        if (fromChain.chain_type === "cosmos" && toChain.chain_type === "cosmos") {
            return await this.skipRoute(
                fromChain,
                fromToken.ibc_denom,
                amount,
                toChain,
                toToken.ibc_denom,
                toAddress,
                slippage,
                chains,
            );
        }

        return await this.squidRoute(
            fromChain.chain_id,
            fromToken.ibc_denom,
            amount,
            fromAddress,
            toChain.chain_id,
            toToken.ibc_denom,
            toAddress,
            slippage
        )
    }

    private async squidRoute(
        fromChain: string | number, 
        fromToken: string, 
        fromAmount: string, 
        fromAddress: string, 
        toChain: string | number, 
        toToken: string,
        toAddress: string,
        slippage: number
    ) {
        try {
            const params = {
                fromChain,
                fromToken,
                fromAmount,
                toChain,
                toToken,
                fromAddress,
                toAddress,
                slippage,
                enableForecall: true,
                quoteOnly: false,
                collectFees: { 
                    integratorAddress: "0xb1f26cf439308842A0a266F2a5756ab71Cf971A2", 
                    fee: 85
                }
            };

            const { route } = await this.squid.getRoute(params);
            
            return route;
        } catch (e: any) {
            console.error(e);
            throw new Error(e.errors[0].message);
        }
    }

    private async squidExecute(
        route: RouteData,
        type: "cosmos" | "evm",
        chain: Chain
    ) {
        let signer = await this.getSigner(type, chain);

        if (type === "evm") {
            const tx = await this.squid.executeRoute({ signer, route }) as ethers.providers.TransactionResponse;
            const txReceipt = await tx.wait();

            return txReceipt;
        }
        // Its a Cosmos -> EVM route if we get here
        const tx = await this.squid.executeRoute({
            signer,
            signerAddress: chain.address,
            route,
        }) as TxRaw;

        const client = await getClient(chain);
        const cosmosTx = await client.broadcastTx(TxRaw.encode(tx).finish())
    
        return cosmosTx;
    }

    private async skipRoute(
        fromChain: RouteChain, 
        fromToken: string, 
        fromAmount: string, 
        toChain: RouteChain, 
        toToken: string,
        toAddress: string,
        slippage: number,
        chains: Chain[],
    ) {
        const fees: Fee[] = [
            {
                basis_points_fee: "57",
                address: "osmo1636lu4j34nk4quf9kpy2gxrjsxpxl92acxexa2"
            },
            {
                basis_points_fee: "28",
                address: "osmo1gpdnc4gggc9c7t5fltrwsufck9ufgx6gv8dsfw"
            }
        ]

        const msg = await getMsgs(fromChain.chain_id, fromToken, toChain.chain_id, toToken, fromAmount, slippage.toString(), chains, toAddress, fees);
        if (!('msgs' in msg)) {
            if ('message' in msg) {
                throw new Error(msg.message)
            }
            throw new Error("Invalid message data.");
        }

        return msg;
    }

    private async skipExecute(msg: SkipMsgs, fromAddress: string, chain: Chain) {
        const messages: EncodeObject[] = msg.msgs.map(item => {
            if (!item.multi_chain_msg.msg || !item.multi_chain_msg.msg_type_url) {
                throw new Error("Invalid message format.");
            }

            let value = _.mapKeys(JSON.parse(item.multi_chain_msg.msg), (value: any, key: any) => _.camelCase(key));
            
            // If cosmwasm turn the json into bytes
            if (item.multi_chain_msg.msg_type_url === "/cosmwasm.wasm.v1.MsgExecuteContract") {
                value.msg = toUtf8(JSON.stringify(value.msg))
            }

            return {
                value: value,
                typeUrl: item.multi_chain_msg.msg_type_url
            };
        });
        const client = await getClient(chain);

        // Simulate the transaction
        const gasEstimation = await client.simulate(fromAddress, messages, "");

        // Calculate the fee using 1.4 multiplier to be safe
        const fee = {
            amount: coins((_.round(gasEstimation*1.4, 0)).toString(), chain.fees.fee_tokens[0].denom),
            gas: (_.round(gasEstimation*1.4, 0)).toString(),
        };

        const tx = await client.signAndBroadcast(fromAddress, messages, fee);

        return tx
    }
}