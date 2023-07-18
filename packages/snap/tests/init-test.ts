import test from "ava";
import { initializeChains } from "../src/initialize";
import fetch from "node-fetch";
import { Chains, Chain } from "../src/types/chains";
import chainsJson from "./public/chain-test.json";

//Initialize Sample Chains
let chain1: Chain = chainsJson[0];
let chain2: Chain = chainsJson[1];

//Initialize Sample Chains
let sampleChains = new Chains([chain1, chain2]);

// Mock the Metamask snap object and its request method
let snapMock = {
  request: (params: any) => {
    if (
      params.method === "snap_manageState" &&
      params.params.operation === "get"
    ) {
      return {
        chains: sampleChains.string(),
      };
    }

    if (
      params.method === "snap_manageState" &&
      params.params.operation === "update"
    ) {
      // Modify the SampleChains and return true
      sampleChains.chains = JSON.parse(params.params.newState.chains);
      return true;
    }

    if (params.method === "snap_getBip44Entropy") {
      return {
        privateKey:
          "fbb8040e52040608d7140bd124e05267d44b984b57cf0f70198bf86c64c90f4a",
      };
    }
  },
};

test.before(() => {
  (globalThis as any).fetch = fetch;
  (globalThis as any).snap = snapMock;
});

test("initializeChains function", async (t) => {
  await t.notThrowsAsync(initializeChains);
});
