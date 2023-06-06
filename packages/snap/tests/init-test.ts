import test from 'ava';
import { initializeChains } from '../src/chains';

test('initializeChains function', async t => {
  t.notThrowsAsync(initializeChains);
});