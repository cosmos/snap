import { Client, ExecutionMethod, Functions } from 'appwrite';
import type { SinglePubkey, StdFee, StdSignature, MultisigThresholdPubkey } from '@cosmjs/amino';
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
  client: Client;
  constructor(appwrite_url: string, project_id: string) {
    this.client = new Client()
      .setEndpoint(appwrite_url)
      .setProject(project_id);
  }

  getMultiSigs = async (memberPk: string): Promise<Multisig[]> => {
      const functions = new Functions(this.client);
      const res = await functions.createExecution('get_multisigs', undefined, undefined, `?memberPk=${encodeURIComponent(memberPk)}`, ExecutionMethod.GET);
      if (res.responseStatusCode !== 200) {
        throw new Error(`Failed to getMultiSigs. ${res.responseBody}`);
      }
      const data = JSON.parse(res.responseBody);
      return data.data;
  };

  createMultiSig = async (name: string, threshold: number, pubKeys: SinglePubkey[]) => {
    const functions = new Functions(this.client);
    const body = { "name": name, "threshold": threshold, "pubKeys": pubKeys };
    const res = await functions.createExecution('create_multisig', JSON.stringify(body), undefined, undefined, ExecutionMethod.POST);
    if (res.responseStatusCode !== 200) {
      throw new Error(`Failed to createMultiSig. ${res.responseBody}`);
    }
    const data = JSON.parse(res.responseBody);
    return data.data;
  };

  createMultiSigTx = async (public_key: MultisigThresholdPubkey, rpc: string | HttpEndpoint, prefix: string, signature: string, body_bytes: string, messages: string, chain_id: string, signer_address: string, fee: StdFee) => {
    const functions = new Functions(this.client);
    const body = { public_key, rpc, prefix, signature, body_bytes, messages, chain_id, signer_address, fee };
    const res = await functions.createExecution('create_multisig_tx', JSON.stringify(body) , undefined, undefined, ExecutionMethod.POST);
    if (res.responseStatusCode !== 200) {
      throw new Error(`Failed to createMultiSigTx. ${res.responseBody}`);
    }
    const data = JSON.parse(res.responseBody);
    return data.data;
  };

  signMultiSigTx = async (public_key: string, rpc: string, fee: StdFee, prefix: string, signature: StdSignature) => {
    const functions = new Functions(this.client);
    const res = await functions.createExecution('sign_multisig_tx', `{ "public_key": "${public_key}", "rpc": "${rpc}", "fee": ${fee}, "prefix": "${prefix}", "signature": ${signature} }`, undefined, undefined, ExecutionMethod.POST);
    if (res.responseStatusCode !== 200) {
      throw new Error(`Failed to signMultiSigTx. ${res.responseBody}`);
    }
    const data = JSON.parse(res.responseBody);
    return data.data;
  };

  getAkashNotifications = async (address: string) => {
      const functions = new Functions(this.client);
      const res = await functions.createExecution('659e1d905dde5ef4504f', undefined, undefined, `?address=${address}`, ExecutionMethod.GET);
      if (res.responseStatusCode !== 200) {
        throw new Error(`Failed to getAkashNotifications. ${res.responseBody}`);
      }
      const data = JSON.parse(res.responseBody);
      return data;
  };

  updateAkashNotifications = async (address: string) => {
      const functions = new Functions(this.client);
      const res = await functions.createExecution('659e1d905dde5ef4504f', '{ "address": "{address}" }'.replace("{address}", address), undefined, undefined, ExecutionMethod.POST);
      if (res.responseStatusCode !== 200) {
        throw new Error(`Failed to updateAkashNotifications. ${res.responseBody}`);
      }
      const data = JSON.parse(res.responseBody);
      return data.data;
  };

}