import { SigningStargateClient, defaultRegistryTypes, createDefaultAminoConverters, AminoTypes } from '@cosmjs/stargate';
import { wasmTypes, createWasmAminoConverters } from '@cosmjs/cosmwasm-stargate';
import { Registry, type GeneratedType } from '@cosmjs/proto-signing';
import type { Chain } from '@cosmsnap/snapper';
import _ from 'lodash';
import rpcs from '../apis.json';

let keyNumia = import.meta.env.VITE_NUMIA_API_KEY;
let keyRhino = import.meta.env.VITE_RHINO_API_KEY;

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
  let chainRpc = rpcs.apis.find(item => item.chain_id == chain.chain_id);
  let signer = window.cosmos.getOfflineSignerOnlyAmino(chain.chain_id);
  // if we dont have a production rpc bank on public registry
  if (chainRpc && keyNumia) {
    const signingClient = await SigningStargateClient.connectWithSigner(
      { url: chainRpc.rpc, headers: { "Authorization": `Bearer ${keyNumia}` } },
      signer,
      {
        registry: new Registry([...defaultRegistryTypes, ...wasmTypes] as Iterable<[string, GeneratedType]>),
        aminoTypes: new AminoTypes({...createDefaultAminoConverters(), ...createWasmAminoConverters()})
      }
    );
    return signingClient
  }

  const signingClient = await SigningStargateClient.connectWithSigner(
      chain.apis.rpc[0].address,
      signer,
      {
        registry: new Registry([...defaultRegistryTypes, ...wasmTypes] as Iterable<[string, GeneratedType]>),
        aminoTypes: new AminoTypes({...createDefaultAminoConverters(), ...createWasmAminoConverters()})
      }
  );

  return signingClient
}