import { SigningStargateClient, defaultRegistryTypes, createDefaultAminoConverters, AminoTypes, GasPrice } from '@cosmjs/stargate';
import { wasmTypes, createWasmAminoConverters } from '@cosmjs/cosmwasm-stargate';
import { Registry } from '@cosmjs/proto-signing';
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

export const getClient = async (chain: Chain, mode: "direct" | "amino" = "direct") => {
  let chainRpc = rpcs.apis.find(item => item.chain_id == chain.chain_id);
  let signer = window.cosmos.getOfflineSigner(chain.chain_id, mode);
  // if we dont have a production rpc bank on public registry
  if (chainRpc && keyNumia && keyRhino) {
    if (chainRpc.provider == 'rhino') {
      const signingClient = await SigningStargateClient.connectWithSigner(
          { url: chainRpc.rpc, headers: { "x-apikey": `${keyRhino}` } },
          signer,
          {
            registry: new Registry([...defaultRegistryTypes, ...wasmTypes]),
            aminoTypes: new AminoTypes({...createDefaultAminoConverters(), ...createWasmAminoConverters()})
          }
      );
      return signingClient
    } else {
      chain = chain as Chain;
      const signingClient = await SigningStargateClient.connectWithSigner(
        { url: chainRpc.rpc, headers: { "Authorization": `Bearer ${keyNumia}` } },
        signer,
        {
          registry: new Registry([...defaultRegistryTypes, ...wasmTypes]),
          aminoTypes: new AminoTypes({...createDefaultAminoConverters(), ...createWasmAminoConverters()})
        }
      );
      return signingClient
    }
  }

  const signingClient = await SigningStargateClient.connectWithSigner(
      chain.apis.rpc[0].address,
      signer,
      {
        registry: new Registry([...defaultRegistryTypes, ...wasmTypes]),
        aminoTypes: new AminoTypes({...createDefaultAminoConverters(), ...createWasmAminoConverters()})
      }
  );

  return signingClient
}