import { expect } from '@jest/globals';
import { RequestOptions, SnapRequest, installSnap } from '@metamask/snaps-jest';
import { text, assert, panel, heading, divider } from '@metamask/snaps-sdk';
import { Chain, CosmosAddress } from './types/chains';
import { Multisig, getMultisigs } from './utils';
import { longify } from '@cosmjs/stargate/build/queryclient';

describe('Snap Calls', () => {
  let request: (request: RequestOptions) => SnapRequest;
  beforeEach(async () => {
    const install = await installSnap();
    request = install.request;
    const response = request({
      method: 'initialize',
    });
    const ui = await response.getInterface();
    assert(ui.type === 'confirmation');
    expect(ui).toRender(panel([
      text(
        "Would you like to add Cosmos chain support within your Metamask wallet?"
      ),
    ]));
    await ui.ok();
    const ui2 = await response.getInterface();
    assert(ui2.type === 'alert');
    expect(ui2).toRender(panel([
      heading("Initialization Successful"),
      text(
        "Cosmos has been added and initialized into your Metamask wallet."
      ),
    ]));
    await ui2.ok();
    const result = await response;
    const res = result.response as any;
    expect(res['result']['success']).toBe(true);
    expect(res['result']['statusCode']).toBe(201);
    expect(res['result']['data'].length > 0).toBe(true);
  }, 50000);

  test('initialized', async () => {
    const response = request({
      method: 'initialized',
    });
    const result = await response;
    const res = result.response as any;
    expect(res['result']['data']['initialized']).toBe(true);
  }, 50000)

  test('changeChain rpc', async () => {
    const params = {
      chain_id: "cosmoshub-4",
      rpc: "https://rpc.cosmos.network"
    }
    const response = request({
      method: 'changeChain',
      params
    });
    const ui = await response.getInterface();
    assert(ui.type === 'confirmation');
    expect(ui).toRender(panel([
      heading(`Confirm Change for Chain ${params.chain_id}`),
      divider(),
      heading("Chain Info"),
      text(`${JSON.stringify(JSON.stringify({ rpc: "https://rpc.cosmos.network" }), null, 4)}`),
      divider(),
      text("Note: this is an advanced, experimental feature so handle it with care."),
    ]));
    await ui.ok();
    const ui2 = await response.getInterface();
    assert(ui2.type === 'alert');
    expect(ui2).toRender(panel([
      heading("Chain Changed"),
      text(
        `Successfully changed the following for chain ${params.chain_id}.`
      ),
      text(JSON.stringify({ rpc: "https://rpc.cosmos.network" }, null, 4)),
    ]));
    await ui2.ok();
  }, 50000)

  test('changeChain coin type', async () => {
    const params = {
      chain_id: "cosmoshub-4",
      slip44: "117"
    }
    const response = request({
      method: 'changeChain',
      params
    });
    const ui = await response.getInterface();
    assert(ui.type === 'confirmation');
    expect(ui).toRender(panel([
      heading(`Confirm Change for Chain ${params.chain_id}`),
      divider(),
      heading("Chain Info"),
      text(`${JSON.stringify(JSON.stringify({ slip44: "117" }), null, 4)}`),
      divider(),
      text("Note: this is an advanced, experimental feature so handle it with care."),
    ]));
    await ui.ok();
    const ui2 = await response.getInterface();
    assert(ui2.type === 'alert');
    expect(ui2).toRender(panel([
      heading("Chain Changed"),
      text(
        `Successfully changed the following for chain ${params.chain_id}.`
      ),
      text(JSON.stringify({ slip44: "117" }, null, 4)),
    ]));
    await ui2.ok();

    // Get the chain and check the slip
    const response2 = request({
      method: 'getChains'
    });
    const result = await response2;
    const res = result.response as any;
    const chains: Chain[] = res['result']['data']['chains'];
    expect(chains.length > 0).toBe(true);
    const chain = chains.find(c => c.chain_id === params.chain_id);
    expect(chain?.slip44).toBe(Number(params.slip44));
  }, 50000)
});

describe('Multisig Calls', () => {
  let request: (request: RequestOptions) => SnapRequest;

  beforeEach(async () => {
    const install = await installSnap();
    request = install.request;
    const response = request({
      method: 'initialize',
    });
    const ui = await response.getInterface();
    assert(ui.type === 'confirmation');
    expect(ui).toRender(panel([
      text(
        "Would you like to add Cosmos chain support within your Metamask wallet?"
      ),
    ]));
    await ui.ok();
    const ui2 = await response.getInterface();
    assert(ui2.type === 'alert');
    expect(ui2).toRender(panel([
      heading("Initialization Successful"),
      text(
        "Cosmos has been added and initialized into your Metamask wallet."
      ),
    ]));
    await ui2.ok();
    const result = await response;
    const res = result.response as any;
    expect(res['result']['success']).toBe(true);
    expect(res['result']['statusCode']).toBe(201);
    expect(res['result']['data'].length > 0).toBe(true);

    // Create a multisig
    
  }, 50000);

  test('create a multisig tx', async () => {
    const responseAdd = request({
      method: 'getChainAddresses',
    });
    const result = await responseAdd;
    const res = result.response as any;
    const addresses: CosmosAddress[] = res['result']['data']['addresses'];
    const address = addresses.find((a: CosmosAddress) => a.chain_id === "cosmoshub-4");
    if (!address) {
      throw new Error("No address found for cosmoshub-4");
    }
    const multisigs: Multisig[] = await getMultisigs(address.address);
    expect(multisigs.length > 0).toBe(true);
    const multisig: Multisig = multisigs[0];
    expect(multisig).toBe(true);
    const fee = {
      amount: [{ denom: "uatom", amount: "1000" }],
      gas: "200000"
    };
    const sign_doc = {
      bodyBytes: Uint8Array.from([1, 2, 3]),
      authInfoBytes: Uint8Array.from([1, 2, 3]),
      chainId: "cosmoshub-4",
      accountNumber: longify(1)
    }
    const params = {
      sign_doc: sign_doc as any,
      signer: address.address,
      multisig: multisig.public_key,
      chain_id: "cosmoshub-4",
      fee
    }
    const response = request({
      method: 'createMultiSigTx',
      params
    });
    const ui = await response.getInterface();
    assert(ui.type === 'confirmation');
    expect(ui).toRender(panel([
      heading(`Confirm Change for Chain ${params.chain_id}`),
      divider(),
      heading("Chain Info"),
      text(`${JSON.stringify(JSON.stringify({ slip44: "117" }), null, 4)}`),
      divider(),
      text("Note: this is an advanced, experimental feature so handle it with care."),
    ]));
  }, 50000)

  // We use this to delete and clean up appwrite from our tests
  afterAll(async () => {}, 50000);
})