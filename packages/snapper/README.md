# Cosmos Extension Metamask Snap Utility Library
Snapper is a utility library for interacting with the official Cosmos Extension for Metamask.

## Functions

### Check If Installed
```typescript
import { isSnapInstalled } from '@cosmsnap/snapper';
let result: boolean = await isSnapInstalled();
```

### Check If Initialized
```typescript
import { isSnapInitialized } from '@cosmsnap/snapper';
let result: boolean = await isSnapInitialized();
```

### Install The Cosmos Extension.
```typescript
import { installSnap } from '@cosmsnap/snapper';
await installSnap();
```

### Suggest Chain.
Use the format like [here](https://github.com/cosmos/chain-registry/blob/master/agoric/chain.json) in the chain registry. The more info the better.
```typescript
import { suggestChain } from '@cosmsnap/snapper';
let chain: Chain = {};
await suggestChain(chain);
```

### Get Chains.
Gets all the chains that are in state within the snap.
```typescript
import { getChains } from '@cosmsnap/snapper';
let chains: []Chain = await getChains();
```

### Delete Chain.
Delete a chain from wallet state.
```typescript
import { deleteChain } from '@cosmsnap/snapper';
await deleteChain("cosmoshub-4");
```

### Sign & Broadcast.
Sign and broadcast a transaction. Note, you can use our production grade infrastructure (RPCs) to broadcast transactions using this function.
```typescript
import { signAndBroadcast } from '@cosmsnap/snapper';
import { DeliverTxResponse } from "@cosmjs/stargate";

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
let txResult: DeliverTxResponse = await signAndBroadcast("cosmoshub-4", msgs, fees);
```

### Sign Transaction.
Just sign a transaction and return it. Note, this does not use our production grade infrastructure. You must use your own to broadcast the transaction.
```typescript
import { sign } from '@cosmsnap/snapper';
import { DeliverTxResponse } from "@cosmjs/stargate";

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
let txResult: DeliverTxResponse = await sign("cosmoshub-4", msgs, fees);
```

### Add Address to Address Book.
```typescript
import { addAddressToBook } from '@cosmsnap/snapper';
await addAddressToBook("cosmoshub-4", "cosmos123456789", "John Doe");
```

### Get Address Book
```typescript
import { getAddressBook } from '@cosmsnap/snapper';
let book: Address[] = await getAddressBook();
```

### Delete Address from Address Book
```typescript
import { deleteAddressFromBook } from '@cosmsnap/snapper';
await deleteAddressFromBook("cosmos123456789");
```

### Get All Bech32 Addresses
Gets all the Bech32 addresses for all chains in state. Note, this is an expensively heavy operation so use wisely.
```typescript
import { getBech32Addresses } from '@cosmsnap/snapper';
let allAddresses: CosmosAddress[] = await getBech32Addresses();
```

### Get All Bech32 Addresses
Gets a Bech32 address for a chain.
```typescript
import { getBech32Addresses } from '@cosmsnap/snapper';
let address: CosmosAddress = await getBech32Address("cosmoshub-4");
```