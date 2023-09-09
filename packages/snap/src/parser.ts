import { GeneratedType, Registry } from "@cosmjs/proto-signing";

import {
    cosmosProtoRegistry,
    cosmwasmProtoRegistry,
    ibcProtoRegistry,
    osmosisProtoRegistry
} from 'osmojs';

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