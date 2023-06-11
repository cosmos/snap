import { OnRpcRequestHandler } from "@metamask/snaps-types";
import { panel, text } from "@metamask/snaps-ui";
import { initializeChains } from "./initialize";
import { Chains } from "./types/chains";
import { Address, Addresses } from "./types/address"
import { ChainState, AddressState } from "./state";

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
    case "initialize":
      // Ensure user confirms initializing Cosmos snap
      let confirmation = await snap.request({
        method: "snap_dialog",
        params: {
          type: "confirmation",
          content: panel([
            text(
              "Would you like to add Cosmos chain support within your Metamask wallet?"
            ),
          ]),
        },
      });
      let chains = new Chains([]);
      if (confirmation) {
        let chainList = await initializeChains();
        chains = new Chains(chainList);
      }
      // add all the default chains into Metamask state
      let res = await ChainState.addChains(chains);
      return res;
    case "transact":
      // Send a transaction to the wallet
      return;
    case "addChain":
      return;
    case "deleteChain":
      // Delete a cosmos chain from the wallet state
      return;
    case "getChains":
      // Get all chains from the wallet state
      return;
    case "addAddress":
      // Add a new address into the address book in wallet state
      if (
        !(
          request.params != null &&
          typeof request.params == "object" &&
          "address" in request.params &&
          typeof request.params.address == "string"
        )
      ) {
        throw new Error("Invalid addAddress request");
      }

      let new_address : Address = JSON.parse(request.params.address);

      return await AddressState.addAddress(new_address)

    case "deleteAddress":
      // Delete an address from the address book in wallet state
      if (
        !(
          request.params != null &&
          typeof request.params == "object" &&
          "chain_id" in request.params &&
          typeof request.params.chain_id == "string"
        )
      ) {
        throw new Error("Invalid addAddress request");
      }

      return await AddressState.removeAddress(request.params.chain_id)

    case "getAddresses":
      // Get all addresses from the address book in wallet state
      return await AddressState.getAddressBook();

    default:
      throw new Error("Method not found.");
  }
};
