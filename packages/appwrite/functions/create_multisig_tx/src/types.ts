import { HttpEndpoint, StdFee } from 'npm:@cosmjs/stargate';
import { MultisigTx } from '../../sign_multisig_tx/src/types.ts';

export interface RequestBody {
  messages: string;
  chain_id: string;
  public_key: string;
  signature: string;
  prefix: string;
  rpc: string | HttpEndpoint;
  signer_address: string;
  fee: StdFee;
}

export interface Multisig {
  threshold: number;
  members: string[];
  name: string;
  public_key: string;
  transactions: MultisigTx[]
}

export interface DB_TX_RETURN {
  total: number;
  documents: MultisigTx[];
}

export const RESOURCE = "multisig";
export const TRANSACTION_COLLECTION_NAME = "transactions";
export const MULTISIG_COLLECTION_NAME = "multisig";