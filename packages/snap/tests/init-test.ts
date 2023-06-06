import test from 'ava';
import { initializeChains } from '../src/chains';

test('initializeChains function', async t => {
  await t.notThrowsAsync(initializeChains);
});