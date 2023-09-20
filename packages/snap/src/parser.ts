import { GeneratedType, Registry } from "@cosmjs/proto-signing";

import {
    cosmosProtoRegistry,
    cosmwasmProtoRegistry,
    ibcProtoRegistry,
    osmosisProtoRegistry
} from 'osmojs';

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
    
    const protoRegistry: ReadonlyArray<[string, GeneratedType]> = [
        ...cosmosProtoRegistry,
        ...cosmwasmProtoRegistry,
        ...ibcProtoRegistry,
        ...osmosisProtoRegistry
    ];
    
    const registry = new Registry(protoRegistry);

    // Get the proto type from the registry
    let protoType = registry.lookupType(typeUrl);

    if (protoType == undefined) {
        return {
            value,
            typeUrl
        }
    }

    // Decode the binary data
    const decoded = protoType.decode(value);

    return {
        typeUrl,
        value: decoded
    }
}