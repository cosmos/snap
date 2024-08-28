import { SigningStargateClient, defaultRegistryTypes, createDefaultAminoConverters, AminoTypes, HttpEndpoint } from '@cosmjs/stargate';
import { wasmTypes, createWasmAminoConverters } from '@cosmjs/cosmwasm-stargate';
import { Registry, type GeneratedType } from '@cosmjs/proto-signing';
import type { Chain } from "@cosmsnap/snapper";
import _ from 'lodash';

export interface Transaction {
  address: string;
  chain: string;
  tx_hash: string;
  when: Date;
}

export interface ChainConfig {
  chain_id: string;
  rest: string;
  rpc: string;
  api_key: string; 
}

export const getClient = async (chain: Chain) => {
  const signer = window.cosmos.getOfflineSignerOnlyAmino(chain.chain_id);
  
  let rpcUrl: string | HttpEndpoint = '';
  
  try {
    // Fetch chain info from chains.cosmos.directory
    const response = await fetch(`https://chains.cosmos.directory/${chain.chain_name.toLowerCase()}`);
    if (!response.ok) throw new Error('Network response was not ok');
    const chainInfo = await response.json();
    
    if (chainInfo.chain.proxy_status.rpc) {
      // Use the proxy/load balancer RPC
      rpcUrl = `https://rpc.cosmos.directory/${chain.chain_name.toLowerCase()}`;
    } else {
      // Fall back to chain.apis RPC
      rpcUrl = chain.apis.rpc[0].address;
    }
  } catch (error) {
    console.error('Error fetching chain info:', error);
    // Fall back to chain.apis RPC if there's an error
    rpcUrl = chain.apis.rpc[0].address;
  }

  const signingClient = await SigningStargateClient.connectWithSigner(
    rpcUrl,
    signer,
    {
      registry: new Registry([...defaultRegistryTypes, ...wasmTypes] as Iterable<[string, GeneratedType]>),
      aminoTypes: new AminoTypes({...createDefaultAminoConverters(), ...createWasmAminoConverters()})
    }
  );

  return signingClient;
}