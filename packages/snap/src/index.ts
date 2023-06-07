import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { panel, text } from '@metamask/snaps-ui';
import { initializeChains } from './initialize';
import { ChainState } from './utils/state';

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
    case 'chains':
      const data = await ChainState.getChains()
      console.debug(data);
      return true
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
      if (!confirmation) {
        throw new Error("Confirmation to add snap denied...")
      }
      let res = await initializeChains();

      return res
    default:
      throw new Error('Method not found.');
  }
};
