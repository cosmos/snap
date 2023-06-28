import test from "ava";
import { initializeChains } from "../src/initialize";
import fetch from "node-fetch";

test.before(() => {
  (globalThis as any).fetch = fetch;
});

test("initializeChains function", async (t) => {
  await t.notThrowsAsync(initializeChains);
});