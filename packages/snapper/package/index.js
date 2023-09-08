"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBech32Address = exports.getBech32Addresses = exports.deleteAddressFromBook = exports.getAddressBook = exports.addAddressToBook = exports.sign = exports.signAndBroadcast = exports.deleteChain = exports.getChains = exports.suggestChain = exports.installSnap = exports.isSnapInitialized = exports.isSnapInstalled = void 0;
const isSnapInstalled = () => __awaiter(void 0, void 0, void 0, function* () {
    let result = yield window.ethereum.request({ method: 'wallet_getSnaps' });
    const installed = Object.keys(result).includes("npm:@cosmsnap/snap");
    return installed;
});
exports.isSnapInstalled = isSnapInstalled;
const isSnapInitialized = () => __awaiter(void 0, void 0, void 0, function* () {
    const initialized = yield window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
            snapId: 'npm:@cosmsnap/snap',
            request: {
                method: 'initialized',
            },
        },
    });
    return initialized;
});
exports.isSnapInitialized = isSnapInitialized;
const installSnap = () => __awaiter(void 0, void 0, void 0, function* () {
    yield window.ethereum.request({
        method: 'wallet_requestSnaps',
        params: {
            'npm:@cosmsnap/snap': {
                version: '^0.1.0',
            },
        },
    });
    yield window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
            snapId: 'npm:@cosmsnap/snap',
            request: {
                method: 'initialize',
            },
        },
    });
});
exports.installSnap = installSnap;
const suggestChain = (chainInfo) => __awaiter(void 0, void 0, void 0, function* () {
    yield window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
            snapId: 'npm:@cosmsnap/snap',
            request: {
                method: 'addChain',
                params: {
                    chain_info: JSON.stringify(chainInfo),
                }
            },
        },
    });
});
exports.suggestChain = suggestChain;
const getChains = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
            snapId: 'npm:@cosmsnap/snap',
            request: {
                method: 'getChains'
            },
        },
    });
    return result.data.chains;
});
exports.getChains = getChains;
const deleteChain = (chain_id) => __awaiter(void 0, void 0, void 0, function* () {
    yield window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
            snapId: 'npm:@cosmsnap/snap',
            request: {
                method: 'deleteChain',
                params: {
                    chain_id,
                }
            },
        },
    });
});
exports.deleteChain = deleteChain;
const signAndBroadcast = (chain_id, msgs, fees) => __awaiter(void 0, void 0, void 0, function* () {
    let result = yield window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
            snapId: 'npm:@cosmsnap/snap',
            request: {
                method: 'transact',
                params: {
                    chain_id,
                    msgs: JSON.stringify(msgs),
                    // Optional: Uses default fees for chain if not specified
                    fees: fees ? JSON.stringify(fees) : null
                }
            },
        },
    });
    return result.data;
});
exports.signAndBroadcast = signAndBroadcast;
const sign = (chain_id, msgs, fees) => __awaiter(void 0, void 0, void 0, function* () {
    let result = yield window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
            snapId: 'npm:@cosmsnap/snap',
            request: {
                method: 'signTx',
                params: {
                    chain_id,
                    msgs: JSON.stringify(msgs),
                    // Optional: Uses default fees for chain if not specified
                    fees: fees ? JSON.stringify(fees) : null
                }
            },
        },
    });
    return result.data;
});
exports.sign = sign;
const addAddressToBook = (chain_id, address, name) => __awaiter(void 0, void 0, void 0, function* () {
    yield window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
            snapId: 'npm:@cosmsnap/snap',
            request: {
                method: 'addAddress',
                params: {
                    chain_id,
                    address,
                    name
                }
            },
        },
    });
});
exports.addAddressToBook = addAddressToBook;
const getAddressBook = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
            snapId: 'npm:@cosmsnap/snap',
            request: {
                method: 'getAddresses'
            },
        },
    });
    return result.data;
});
exports.getAddressBook = getAddressBook;
const deleteAddressFromBook = (address) => __awaiter(void 0, void 0, void 0, function* () {
    yield window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
            snapId: 'npm:@cosmsnap/snap',
            request: {
                method: 'deleteAddress',
                params: {
                    address
                }
            },
        },
    });
});
exports.deleteAddressFromBook = deleteAddressFromBook;
const getBech32Addresses = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
            snapId: 'npm:@cosmsnap/snap',
            request: {
                method: 'getChainAddresses',
            },
        },
    });
    return result.data.addresses;
});
exports.getBech32Addresses = getBech32Addresses;
const getBech32Address = (chain_id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
            snapId: 'npm:@cosmsnap/snap',
            request: {
                method: 'getChainAddress',
                params: {
                    chain_id,
                }
            },
        },
    });
    return result.data;
});
exports.getBech32Address = getBech32Address;
//# sourceMappingURL=index.js.map