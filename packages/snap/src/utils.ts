import { Coin, SinglePubkey, StdSignature } from "@cosmjs/amino";
import { Chain } from "./types/chains";
import { Client, ExecutionMethod, Functions } from 'appwrite';
import { HttpEndpoint, StargateClient, StdFee } from "@cosmjs/stargate";

if (!process.env.DENO_SERVERLESS_URL) {
  throw new Error("DENO_SERVERLESS_URL not set...");
}
export const denoUrl = process.env.DENO_SERVERLESS_URL;
const appwrite_url = process.env.APPWRITE_URL;
if (!appwrite_url) {
  throw new Error("APPWRITE_URL is not defined");
}
const project_id = process.env.APPWRITE_FUNCTION_PROJECT_ID;
if (!project_id) {
  throw new Error("APPWRITE_FUNCTION_PROJECT_ID is not defined");
}

const client = new Client()
  .setEndpoint(appwrite_url)
  .setProject(project_id);

export interface CoinIBC extends Coin {
  ibc: boolean;
  ibc_denom?: string;
  display: string;
}

export interface ChainBalances extends Chain {
    balances: CoinIBC[];
}

export interface Multisig {
    threshold: number;
    members: string[];
    name: string;
    public_key: string;
  }

export const getBalances = async (chains: Chain[]): Promise<ChainBalances[]> => {
    try {
        const res = await fetch(`${denoUrl}/balances`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
            body: JSON.stringify({ chains: chains })
        });

        if (!res.ok) {
            throw new Error(`HTTP error ${res.status}`);
        }

        const data = await res.json();

        return data.balances;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getMultisigTx = async (address: string) => {
    const functions = new Functions(client);
    const res = await functions.createExecution('get_multisig_tx', '{ "address": "{address}" }'.replace("{address}", address), undefined, undefined, ExecutionMethod.POST);
    if (res.responseStatusCode !== 200) {
        throw new Error(`Failed to getMultisigTx. ${res.responseBody}`);
    }
    const data = JSON.parse(res.responseBody);
    return data.data;
};

export const createMultiSigTx = async (chain_id: string, messages: string, signature: string, public_key: string, rpc: string | HttpEndpoint, prefix: string, signer_address: string, fee: StdFee) => {
    const functions = new Functions(client);
    const res = await functions.createExecution('create_multisig_tx', `{ "chain_id": "${chain_id}", "messages": "${messages}", "signature": "${signature}", "public_key": "${public_key}", "rpc": "${rpc}", "prefix": "${prefix}", "signer_address": "${signer_address}" "fee": "${fee}" }`, undefined, undefined, ExecutionMethod.POST);
    if (res.responseStatusCode !== 200) {
        throw new Error(`Failed to createMultiSigTx. ${res.responseBody}`);
    }
    const data = JSON.parse(res.responseBody);
    return data.data;
};

export const signMultiSigTx = async (public_key: string, rpc: string | HttpEndpoint, fee: StdFee, prefix: string, signature: StdSignature) => {
    const functions = new Functions(client);
    const res = await functions.createExecution('sign_multisig_tx', `{ "public_key": "${public_key}", "rpc": "${rpc}", "fee": "${fee}", "prefix": "${prefix}", "signature": "${signature}" }`, undefined, undefined, ExecutionMethod.POST);
    if (res.responseStatusCode !== 200) {
        throw new Error(`Failed to signMultiSigTx. ${res.responseBody}`);
    }
    const data = JSON.parse(res.responseBody);
    return data;
};

export const createMultiSig = async (name: string, threshold: number, addresses: string[], chain_id: string, rpc: string | HttpEndpoint) => {
    const pubKeysP = addresses.map(async (address) => {
        return getPubKeyFromAddress(address, chain_id, rpc);
    })
    const pubKeys: SinglePubkey[] = await Promise.all(pubKeysP);
    const functions = new Functions(client);
    const res = await functions.createExecution('create_multisig', `{ "name": "${name}", "threshold": "${threshold}", "pubKeys": "${pubKeys}" }`, undefined, undefined, ExecutionMethod.POST);
    if (res.responseStatusCode !== 200) {
        throw new Error(`Failed to createMultiSig. ${res.responseBody}`);
    }
    const data = JSON.parse(res.responseBody);
    return data.data;
};

export const getPubKeyFromAddress = async (address: string, chain_id: string, rpc: string | HttpEndpoint) => {
    const client = await StargateClient.connect(rpc);
    const account = await client.getAccount(address);
    if (!account || !account.pubkey) {
        throw new Error(
        `Account ${address} does not exist on chain ${chain_id}, please create a transaction with this address to create the address.`,
        );
    }

    return account.pubkey;
}