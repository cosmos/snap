import { StdFee, StdSignature } from 'npm:@cosmjs/launchpad';
import { HttpEndpoint } from 'npm:@cosmjs/stargate';

export interface RequestBody {
  id: string;
  password: string;
  multisig_id: string;
  rpc: string | HttpEndpoint;
  fee: StdFee;
  prefix: string;
  signature: StdSignature;
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
    akash_address: string;
}

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