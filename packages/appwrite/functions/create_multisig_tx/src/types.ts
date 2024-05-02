import { HttpEndpoint, StdFee } from 'npm:@cosmjs/stargate';

export interface MultisigTx {
  multisigs: Multisig;
  tx_id: string;
  chain_id: string;
  type_url: string;
  message: string;
  status: MultisigTxStatus;
  signatures: string[];
  body_bytes: string;
  sequence: number;
}

enum MultisigTxStatus {
  Created = 'created',
}

export interface Signature {
  address: string;
  signature: string;
}

export interface RequestBody {
  messages: string;
  chain_id: string;
  public_key: string;
  signature: string;
  body_bytes: string;
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