import { expect } from '@jest/globals';
import { RequestOptions, SnapRequest, installSnap } from '@metamask/snaps-jest';
import { text, assert, panel, heading, divider } from '@metamask/snaps-sdk';
import { Chain } from './types/chains';

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