import { GeneratedType, Registry, isTxBodyEncodeObject } from "@cosmjs/proto-signing";
import { TxBody } from "cosmjs-types/cosmos/tx/v1beta1/tx";

import {
    cosmosProtoRegistry,
    cosmwasmProtoRegistry,
    ibcProtoRegistry,
    osmosisProtoRegistry
} from 'osmojs';

import { getAkashTypeRegistry } from "@akashnetwork/akashjs/build/stargate/index";

import {
  MsgProvision,
  MsgWalletSpendAction,
} from '@agoric/cosmic-proto/swingset/msgs.js';

export const bigintReplacer = (value: any): any => {
  if (typeof value === 'bigint') {
    return value.toString();
  }

  if (typeof value === 'object' && value !== null) {
    return bigintReplacerObject(value);
  }

  return value;
}

export const bigintReplacerObject = (value: any): any => {
  if (Array.isArray(value)) {
    return value.map(bigintReplacer);
  }

  const newObj: any = {};
  for (const key in value) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      newObj[key] = bigintReplacer(value[key]);
    }
  }
  return newObj;
}

export const decodeProtoMessage = async (typeUrl: string, value: Uint8Array) => {

    const akashRegistryTypes = getAkashTypeRegistry();

    const agoricRegistryTypes: [string, GeneratedType][] = [
      ['/agoric.swingset.MsgWalletSpendAction', MsgWalletSpendAction as any],
      ['/agoric.swingset.MsgProvision', MsgProvision as any],
    ];

    const protoRegistry = [
        ...cosmosProtoRegistry,
        ...cosmwasmProtoRegistry,
        ...ibcProtoRegistry,
        ...osmosisProtoRegistry,
        ...akashRegistryTypes,
        ...agoricRegistryTypes,
    ];
    
    const registry = new Registry(protoRegistry as Iterable<[string, GeneratedType]>);

    // Get the proto type from the registry
    let protoType = registry.lookupType(typeUrl);

    // We return null to indicate blind signing event if the type is not found or its not txbody
    if ((protoType == undefined) && (!isTxBodyEncodeObject({typeUrl, value}))) {
        return {
            value: null,
            typeUrl
        }
    }

    // Decode the binary data
    const decoded = registry.decode({ typeUrl, value });

    return {
        typeUrl,
        value: decoded
    }
}

export const decodeTxBodyIntoMessages = async (typeUrl: string, value: Uint8Array) => {

  if (!isTxBodyEncodeObject({typeUrl, value})) {
    throw new Error("Not a TxBody type URL");
  }

  const body = TxBody.decode(value);

  return body.messages;

}