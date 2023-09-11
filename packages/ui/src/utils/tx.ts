import { SigningStargateClient } from '@cosmjs/stargate';
import type { Chain } from '@cosmsnap/snapper';
import _ from 'lodash';
import rpcs from '../rpcs.json';

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
  // if we dont have a production rpc bank on public registry
  if (!chainRpc) {
    let signer = await window.cosmos.getOfflineSigner(chain.chain_id);
    const signingClient = await SigningStargateClient.connectWithSigner(
        chain.apis.rpc[0].address,
        signer
    );
    return signingClient
  }
  let signer = await window.cosmos.getOfflineSigner(chain.chain_id);
  const signingClient = await SigningStargateClient.connectWithSigner(
      { url: chainRpc.rpc, headers: { "Authorization": `Bearer ${chainRpc.api_key}` } },
      signer
  );
  return signingClient
}