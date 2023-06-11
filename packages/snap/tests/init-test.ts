import test from "ava";
import { initializeChains } from "../src/initialize";

test("initializeChains function", async (t) => {
  await t.notThrowsAsync(initializeChains);
});
