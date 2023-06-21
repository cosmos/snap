import { OnRpcRequestHandler } from "@metamask/snaps-types";
import { panel, text } from "@metamask/snaps-ui";
import { initializeChains } from "./initialize";
import { Chains } from "./types/chains";
import { Address, Addresses } from "./types/address";
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
  let confirmation: any;

  switch (request.method) {
    case "initialize":
      // Ensure user confirms initializing Cosmos snap
      confirmation = await snap.request({
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

      if (!confirmation) {
        throw new Error("Initialization declined");
      }

      let chainList = await initializeChains();
      chains = new Chains(chainList);

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
      //Ensure addAddress request is valid
      if (
        !(
          request.params !== null &&
          typeof request.params === "object" &&
          "address" in request.params &&
          typeof request.params.address === "string" &&
          "chain_id" in request.params &&
          typeof request.params.chain_id === "string" &&
          "name" in request.params &&
          typeof request.params.name === "string"
        )
      ) {
        throw new Error("Invalid addAddress request");
      }

      // Ensure user confirms the new address
      confirmation = await snap.request({
        method: "snap_dialog",
        params: {
          type: "confirmation",
          content: panel([
            text(
              `Do you want to add ${request.params.address} to the chain ${request.params.chain_id}?`
            ),
          ]),
        },
      });

      //If user declined confirmation, throw error
      if (!confirmation) {
        throw new Error("Add address action declined");
      }

      //create Address object with new address
      let new_address: Address = {
        name: request.params.name,
        address: request.params.address,
        chain_id: request.params.chain_id,
      };

      return await AddressState.addAddress(new_address);

    case "deleteAddress":
      // Ensure deleteAddress request is valid
      if (
        !(
          request.params !== null &&
          typeof request.params === "object" &&
          "address" in request.params &&
          typeof request.params.address === "string"
        )
      ) {
        throw new Error("Invalid deleteAddress request");
      }

      // Ensure user confirms the chain_id of the address to be deleted
      confirmation = await snap.request({
        method: "snap_dialog",
        params: {
          type: "confirmation",
          content: panel([
            text(
              `Do you want to delete the address ${request.params.address} from your address book?`
            ),
          ]),
        },
      });

      //If user declined confirmation, throw error
      if (!confirmation) {
        throw new Error("deleteAddress action declined");
      }

      return await AddressState.removeAddress(request.params.address);

    case "getAddresses":
      // Get all addresses from the address book in wallet state
      return await AddressState.getAddressBook();

    default:
      throw new Error("Method not found.");
  }
};
