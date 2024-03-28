import { Client, ExecutionMethod, Functions } from 'appwrite';

const appwrite_url = import.meta.env.VITE_APPWRITE_URL;
if (!appwrite_url) {
  throw new Error("VITE_APPWRITE_URL is not defined");
}
const project_id = import.meta.env.VITE_APPWRITE_FUNCTION_PROJECT_ID;
if (!project_id) {
  throw new Error("VITE_APPWRITE_FUNCTION_PROJECT_ID is not defined");
}

const client = new Client()
  .setEndpoint(appwrite_url)
  .setProject(project_id);

export const getMultiSigs = async (address: string) => {
    const functions = new Functions(client);
    const res = await functions.createExecution('get_multisigs', undefined, undefined, `?address=${address}`, ExecutionMethod.GET);
    if (res.responseStatusCode !== 200) {
      throw new Error(`Failed to getMultiSigs. ${res.responseBody}`);
    }
    return JSON.parse(res.responseBody);
};

export const createMultiSig = async (address: string) => {
  const functions = new Functions(client);
  const res = await functions.createExecution('create_multisig', '{ "address": "{address}" }'.replace("{address}", address), undefined, undefined, ExecutionMethod.POST);
  if (res.responseStatusCode !== 200) {
    throw new Error(`Failed to createMultiSig. ${res.responseBody}`);
  }
  return JSON.parse(res.responseBody);
};

export const createMultiSigTx = async (address: string) => {
  const functions = new Functions(client);
  const res = await functions.createExecution('create_multisig_tx', '{ "address": "{address}" }'.replace("{address}", address), undefined, undefined, ExecutionMethod.POST);
  if (res.responseStatusCode !== 200) {
    throw new Error(`Failed to createMultiSigTx. ${res.responseBody}`);
  }
  return JSON.parse(res.responseBody);
};

export const signMultiSigTx = async (address: string) => {
  const functions = new Functions(client);
  const res = await functions.createExecution('sign_multisig_tx', '{ "address": "{address}" }'.replace("{address}", address), undefined, undefined, ExecutionMethod.POST);
  if (res.responseStatusCode !== 200) {
    throw new Error(`Failed to signMultiSigTx. ${res.responseBody}`);
  }
  return JSON.parse(res.responseBody);
};

export const getAkashNotifications = async (address: string) => {
    const functions = new Functions(client);
    const res = await functions.createExecution('659e1d905dde5ef4504f', undefined, undefined, `?address=${address}`, ExecutionMethod.GET);
    if (res.responseStatusCode !== 200) {
      throw new Error(`Failed to getAkashNotifications. ${res.responseBody}`);
    }
    return JSON.parse(res.responseBody);
};

export const updateAkashNotifications = async (address: string) => {
    const functions = new Functions(client);
    const res = await functions.createExecution('659e1d905dde5ef4504f', '{ "address": "{address}" }'.replace("{address}", address), undefined, undefined, ExecutionMethod.POST);
    if (res.responseStatusCode !== 200) {
      throw new Error(`Failed to updateAkashNotifications. ${res.responseBody}`);
    }
    return JSON.parse(res.responseBody);
};