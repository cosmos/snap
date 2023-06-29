import { OnRpcRequestHandler } from "@metamask/snaps-types";
import { panel, text } from "@metamask/snaps-ui";
import { initializeChains } from "./initialize";
import { Chain, Chains, Fees } from "./types/chains";
import { Address } from "./types/address";
import { ChainState, AddressState } from "./state";
import { Result } from "./types/result";
import { submitTransaction } from "./transaction";

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.request - A validated JSON-RPC request object.
 * @returns A result object.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }): Promise<Result> => {
  let res: Object = {};
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
      res = await ChainState.addChains(chains);

      return {
        data: res,
        success: true,
        statusCode: 200
      };
    case "transact":
      // Send a transaction to the wallet
      if (
        !(
          request.params != null &&
          typeof request.params == "object" &&
          "msgs" in request.params &&
          "chain_id" in request.params &&
          typeof request.params.msgs == "string" &&
          typeof request.params.chain_id == "string"
        )
      ) {
        throw new Error("Invalid transact request");
      }

      let fees: Fees = {
        amount: [],
        gas: "200000"
      }
      if (request.params.fees) {
        if (typeof request.params.fees == "string") {
          fees = JSON.parse(request.params.fees)
        }
      }

      let result = await submitTransaction(request.params.chain_id, JSON.parse(request.params.msgs), fees)

      return {
        data: result,
        success: true,
        statusCode: 201
      };
    case "addChain":
      if (
        !(
          request.params != null &&
          typeof request.params == "object" &&
          "chain_info" in request.params &&
          typeof request.params.chain_info == "string"
        )
      ) {
        throw new Error("Invalid addAddress request");
      }

      let new_chain: Chain = JSON.parse(request.params.chain_info);

      let new_chains = await ChainState.addChain(new_chain);

      return {
        data: new_chains,
        success: true,
        statusCode: 201
      };
    case "deleteChain":
      // Delete a cosmos chain from the wallet state
      if (
        !(
          request.params != null &&
          typeof request.params == "object" &&
          "chain_id" in request.params &&
          typeof request.params.chain_id == "string"
        )
      ) {
        throw new Error("Invalid deleteChain request");
      }

      res = await ChainState.removeChain(request.params.chain_id)

      return {
        data: res,
        success: true,
        statusCode: 201
      };
    case "getChains":
      // Get all chains from the wallet state
      res = await ChainState.getChains();

      return {
        data: res,
        success: true,
        statusCode: 200
      };
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

      res = await AddressState.addAddress(new_address);

      return {
        data: res,
        success: true,
        statusCode: 201
      };

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

      res = await AddressState.removeAddress(request.params.chain_id)

      return {
        data: res,
        success: true,
        statusCode: 201
      };

    case "getAddresses":
      // Get all addresses from the address book in wallet state
      res = await AddressState.getAddressBook();

      return {
        data: res,
        success: true,
        statusCode: 200
      };

    default:
      throw new Error("Method not found.");
  }
};
