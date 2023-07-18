import test from "ava";
import { ChainState } from "../src/state";
import { Chains, Chain } from "../src/types/chains";
import chainsJson from "./public/chain-test.json";

class PassingChainStateTests {
  //Initialize Sample Chains
  chain1: Chain = chainsJson[0];
  chain2: Chain = chainsJson[1];

  //Initialize Sample Chains
  SampleChains = new Chains([this.chain1, this.chain2]);

  // Mock the Metamask snap object and its request method
  snapMock = {
    request: (params: any) => {
      if (
        params.method === "snap_manageState" &&
        params.params.operation === "get"
      ) {
        return {
          chains: this.SampleChains.string(),
        };
      }

      if (
        params.method === "snap_manageState" &&
        params.params.operation === "update"
      ) {
        // Modify the SampleChains and return true
        this.SampleChains.chains = JSON.parse(params.params.newState.chains);
        return true;
      }
    },
  };

  constructor() {
    test.before(() => {
      (globalThis as any).snap = this.snapMock;
    });
  }

  //getChains function should return current state of Chains
  async getChainsTest(t: any) {
    //get current state of Chains
    const result = await ChainState.getChains();

    t.deepEqual(result.chains, [chainsJson[0], chainsJson[1]]);
  }

  //getChain function should return the chain with matching chain_id
  async getChainPassTest(t: any) {
    //get the chain matching given chain_id
    const result = await ChainState.getChain("cosmoshub-4");

    t.deepEqual(result, chainsJson[1]);
  }

  //addChain function should add chain to current state of Chains
  async addChainPassTest(t: any) {
    //Initialize new chain
    const new_chain: Chain = chainsJson[2];

    //Add new chain to Chains
    await ChainState.addChain(new_chain);

    //Get updated Chains
    const result = await ChainState.getChains();

    t.deepEqual(result.chains, chainsJson);
  }

  //removeChain function should delete the chain matching the given chain_id
  async removeChainPassTest(t: any) {
    await ChainState.removeChain("cosmoshub-4");

    const result = await ChainState.getChains();

    t.deepEqual(result.chains, [chainsJson[0], chainsJson[2]]);
  }

  //addChains function should replace the current Chains with a new one
  async addChainsPassTest(t: any) {
    //Initialize new chain
    const new_chain: Chain = chainsJson[2];

    //Initialize new chains
    let new_chains = new Chains([new_chain]);

    //Add new chain to Chains
    await ChainState.addChains(new_chains);

    //Get updated Chains
    const result = await ChainState.getChains();

    t.deepEqual(result.chains, [chainsJson[2]]);
  }
}

const tests = new PassingChainStateTests();

test.serial("ChainState Tests", async (t) => {
  await tests.getChainsTest(t);
  await tests.getChainPassTest(t);
  await tests.addChainPassTest(t);
  await tests.removeChainPassTest(t);
  await tests.addChainsPassTest(t);
});
