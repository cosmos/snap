import { HttpEndpoint } from '@cosmjs/stargate';

export interface RequestBody {
  message: string;
  type_url: string;
  chain_id: string;
  multisig_id: string;
  signature: string;
  address: string;
  prefix: string;
  rpc: string | HttpEndpoint;
}

export interface Multisig {
  threshold: Number;
  members: string[];
  name: string;
  akash_address: string;
}