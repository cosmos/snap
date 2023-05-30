import { JsonRpcRequest, OnRpcRequestHandler } from '@metamask/snaps-types';
import { panel, text } from '@metamask/snaps-ui';
import { initializeChains } from './chains';
import { Chains } from './types/chains';

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of the method (boolean).
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'initialize':
      // Ensure user confirms initializing Cosmos snap
      let confirmation = await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: panel([
            text('Would you like to add Cosmos chain support within your Metamask wallet?'),
          ]),
        },
      });
      let chains = new Chains([]);
      if (confirmation) {
        chains = await initializeChains();
      }
      let res = await snap.request({
        method: 'snap_manageState',
        params: { operation: 'update', newState: { chains: chains.string() } },
      });
      return res
    default:
      throw new Error('Method not found.');
  }
};
