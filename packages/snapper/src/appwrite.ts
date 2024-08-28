import type { SinglePubkey, StdFee, MultisigThresholdPubkey } from '@cosmjs/amino';
import { HttpEndpoint } from "@cosmjs/stargate";

enum MultisigTxStatus {
  Created = 'created',
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

export interface Multisig {
  threshold: number;
  members: string[];
  name: string;
  public_key: string;
  akash_address: string;
  transactions: MultisigTx[];
  $id: string;
}

export class Appwrite {
  client: any;
  isServer: boolean;

  constructor(appwrite_url: string, project_id: string) {
    this.isServer = typeof window === 'undefined';
    this.initializeClient(appwrite_url, project_id);
  }

  private async initializeClient(appwrite_url: string, project_id: string) {
    if (this.isServer) {
      const { Client } = await import('node-appwrite');
      this.client = new Client();
    } else {
      const { Client } = await import('appwrite');
      this.client = new Client();
    }
    this.client.setEndpoint(appwrite_url).setProject(project_id);
  }

  private async getFunctions() {
    if (this.isServer) {
      const { Functions } = await import('node-appwrite');
      return new Functions(this.client);
    } else {
      const { Functions } = await import('appwrite');
      return new Functions(this.client);
    }
  }

  private async getExecutionMethod() {
    if (this.isServer) {
      const { ExecutionMethod } = await import('node-appwrite');
      return ExecutionMethod;
    } else {
      const { ExecutionMethod } = await import('appwrite');
      return ExecutionMethod;
    }
  } 

  getMultiSigs = async (memberPk: string): Promise<Multisig[]> => {
    const functions = await this.getFunctions();
    const executionMethod = await this.getExecutionMethod();
    const res = await functions.createExecution('get_multisigs', undefined, undefined, `?memberPk=${encodeURIComponent(memberPk)}`, executionMethod.GET);
    if (res.responseStatusCode !== 200) {
      throw new Error(`Failed to getMultiSigs. ${res.responseBody}`);
    }
    const data = JSON.parse(res.responseBody);
    if (data.success === false) {
      throw new Error(`Error Occured: ${data.data}`);
    }
    return data.data;
  };

  createMultiSig = async (name: string, threshold: number, pubKeys: SinglePubkey[]) => {
    const functions = await this.getFunctions();
    const body = { "name": name, "threshold": threshold, "pubKeys": pubKeys };
    const executionMethod = await this.getExecutionMethod();
    const res = await functions.createExecution('create_multisig', JSON.stringify(body), undefined, undefined, executionMethod.POST);
    if (res.responseStatusCode !== 200) {
      throw new Error(`Failed to createMultiSig. ${res.responseBody}`);
    }
    const data = JSON.parse(res.responseBody);
    if (data.success === false) {
      throw new Error(`Error Occured: ${data.data}`);
    }
    return data.data;
  };

  createMultiSigTx = async (public_key: MultisigThresholdPubkey, rpc: string | HttpEndpoint, prefix: string, signature: string, body_bytes: string, messages: string, chain_id: string, signer_address: string, fee: StdFee) => {
    const functions = await this.getFunctions();
    const body = { public_key, rpc, prefix, signature, body_bytes, messages, chain_id, signer_address, fee };
    const executionMethod = await this.getExecutionMethod();
    const res = await functions.createExecution('create_multisig_tx', JSON.stringify(body) , undefined, undefined, executionMethod.POST);
    if (res.responseStatusCode !== 200) {
      throw new Error(`Failed to createMultiSigTx. ${res.responseBody}`);
    }
    const data = JSON.parse(res.responseBody);
    if (data.success === false) {
      throw new Error(`Error Occured: ${data.data}`);
    }
    return data.data;
  };

  signMultiSigTx = async (public_key: string, rpc: string | HttpEndpoint, fee: StdFee, prefix: string, signature: string, signer_address: string) => {
    const functions = await this.getFunctions();
    const body = { public_key, rpc, fee, prefix, signature, signer_address };
    const executionMethod = await this.getExecutionMethod();
    const res = await functions.createExecution('sign_multisig_tx', JSON.stringify(body), undefined, undefined, executionMethod.POST);
    if (res.responseStatusCode !== 200) {
      throw new Error(`Failed to signMultiSigTx. ${res.responseBody}`);
    }
    const data = JSON.parse(res.responseBody);
    if (data.success === false) {
      throw new Error(`Error Occured: ${data.data}`);
    }
    return data.data;
  };

  deleteMultisigTx = async (tx_id: string) => {
    const functions = await this.getFunctions();
    const body = { tx_id };
    const executionMethod = await this.getExecutionMethod();
    const res = await functions.createExecution('delete_multisig_tx', JSON.stringify(body), undefined, undefined, executionMethod.POST);
    if (res.responseStatusCode !== 200) {
      throw new Error(`Failed to deleteMultisigTx. ${res.responseBody}`);
    }
    const data = JSON.parse(res.responseBody);
    if (data.success === false) {
      throw new Error(`Error Occured: ${data.data}`);
    }
    return data.data;
  };

}