# Cosmos MetaMask Snap
Cosmos Metamask Snap aims to add full support of Metamask, a highly popular Ethereum wallet, to all Cosmos SDK blockchains, potentially opening the door to over 30 million Ethereum users and stimulating growth for every project in the Cosmos ecosystem.

## Developer Preview Software
Please note, to develop this Metamask Snap you need to use Metamask Flask, a canary distribution for developers that provides access to upcoming features wihtin Metamask.

## Contribution
Your contributions are always welcome! Please have a look at the [contribution guidelines](CONTRIBUTING.md) first.

## Running Snap
```bash
yarn install
cd packages/snap
yarn start
```

## Running Snap UI
```bash
yarn install
cd packages/ui
yarn run dev
```

## Install & Initialize
```javascript
// Check if the Snap is installed
await window.ethereum.request({ method: 'wallet_getSnaps' });
const installed = Object.keys(result).includes("npm:@cosmos/snap");

// Install Snap
if (!installed) {
    const result = await window.ethereum.request({
        method: 'wallet_requestSnaps',
        params: {
            'npm:@cosmos/snap': {
            version: '^0.1.0',
            },
        },
    });
}

// Initialize the Snap with default chains
await ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
        snapId: 'npm:@cosmos/snap',
        request: {
            method: 'initialize',
        },
    },
});
```

## Check If Initialized
```javascript
// Boolean is returned
const initialized = await ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
        snapId: 'npm:@cosmos/snap',
        request: {
            method: 'initialized',
        },
    },
});
```

## Suggest Chain
```javascript
// chainInfo should be structured like this https://github.com/cosmos/chain-registry/tree/master/agoric
await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
        snapId: 'npm:@cosmos/snap',
        request: {
            method: 'addChain',
            param: {
                chain_info: JSON.stringify(chainInfo),
            }
        },
    },
});
```

## Get Chains
```javascript
const chains = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
        snapId: 'npm:@cosmos/snap',
        request: {
            method: 'getChains'
        },
    },
});
```

## Delete Chain
```javascript
const chain = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
        snapId: 'npm:@cosmos/snap',
        request: {
            method: 'deleteChain',
            param: {
                chain_id: 'cosmoshub-4',
            }
        },
    },
});
```

## Send Transaction
```javascript
const msgs = [
    {
        typeUrl: "/cosmos.bank.v1beta1.MsgSend",
        value: {
            fromAddress: senderAddress,
            toAddress: recipientAddress,
            amount: [{
                denom: "uatom",
                amount: "500000"
            }],
        },
    }
];
const fees = {
    amount: [{
        denom: "uatom",
        amount: "500"
    }],
    gas: "200000"
};
const address = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
        snapId: 'npm:@cosmos/snap',
        request: {
            method: 'transact',
            param: {
                chain_id: 'cosmoshub-4',
                msgs: JSON.stringify(msgs),
                // Optional: Uses default fees for chain if not specified
                fees: JSON.stringify(fees)
            }
        },
    },
});
```

## Add Address (Address Book)
```javascript
const address = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
        snapId: 'npm:@cosmos/snap',
        request: {
            method: 'addAddress',
            param: {
                chain_id: 'cosmoshub-4',
                address: 'cosmos123456789',
                name: 'John Cosmos'
            }
        },
    },
});
```

## Get Addresses (Address Book)
```javascript
const address = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
        snapId: 'npm:@cosmos/snap',
        request: {
            method: 'getAddresses'
        },
    },
});
```

## Delete Address (Address Book)
```javascript
const address = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
        snapId: 'npm:@cosmos/snap',
        request: {
            method: 'deleteAddress',
            params: {
                address: 'cosmos123456789'
            }
        },
    },
});
```

## Get Bech32 Address
```javascript
const address = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
        snapId: 'npm:@cosmos/snap',
        request: {
            method: 'getChainAddress',
            param: {
                chain_id: 'cosmoshub-4',
            }
        },
    },
});
```

## Get Bech32 Addresses
```javascript
const address = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
        snapId: 'npm:@cosmos/snap',
        request: {
            method: 'getChainAddresses'
        },
    },
});
```