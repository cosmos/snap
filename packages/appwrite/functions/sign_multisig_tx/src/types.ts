import { StdFee } from 'npm:@cosmjs/launchpad';
import { HttpEndpoint } from 'npm:@cosmjs/stargate';

export interface RequestBody {
  id: string;
  public_key: string;
  rpc: string | HttpEndpoint;
  fee: StdFee;
  prefix: string;
  signature: string;
  signer_address: string;
}

export interface Signature {
  address: string;
  signature: string;
}

enum MultisigTxStatus {
  Created = 'created',
}

export interface Multisig {
    threshold: number;
    members: string[];
    name: string;
    public_key: string;
    transactions: MultisigTx[]
}

export interface MultisigTx {
  multisigs: Multisig;
  $id: string;
  chain_id: string;
  type_url: string;
  message: string;
  status: MultisigTxStatus;
  signatures: string[];
  body_bytes: string;
  sequence: number;
}

export interface DB_TX_RETURN {
  total: number;
  documents: MultisigTx[];
}

export const RESOURCE = "multisig";
export const TRANSACTION_COLLECTION_NAME = "transactions";
export const MULTISIG_COLLECTION_NAME = "multisig";