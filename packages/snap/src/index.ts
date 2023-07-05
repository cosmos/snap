import { OnRpcRequestHandler } from "@metamask/snaps-types";
import { panel, text, heading, divider } from "@metamask/snaps-ui";
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
export const onRpcRequest: OnRpcRequestHandler = async ({
  request,
}): Promise<Result> => {
  let res: Object = {};
  let confirmation: string | boolean | null = false;
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
      if (!confirmation) {
        throw new Error("Initialize Cosmos chain support was denied.")
      }
      let chains = new Chains([]);
      let chainList = await initializeChains();
      chains = new Chains(chainList);
      // add all the default chains into Metamask state
      res = await ChainState.addChains(chains);

      return {
        data: res,
        success: true,
        statusCode: 200,
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

      // Ensure user confirms transaction
      confirmation = await snap.request({
        method: "snap_dialog",
        params: {
          type: "confirmation",
          content: panel([
            heading("Confirm Transaction"),
            divider(),
            heading("Chain"),
            text(
              `${request.params.chain_id}`
            ),
            divider(),
            heading("Chain"),
            text(
              `${request.params.msgs}`
            ),
          ]),
        },
      });
      if (!confirmation) {
        throw new Error("Transaction was denied.")
      }

      let fees: Fees = {
        amount: [],
        gas: "200000",
      };
      if (request.params.fees) {
        if (typeof request.params.fees == "string") {
          fees = JSON.parse(request.params.fees);
        }
      }

      let result = await submitTransaction(
        request.params.chain_id,
        JSON.parse(request.params.msgs),
        fees
      );

      return {
        data: result,
        success: true,
        statusCode: 201,
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

      // Ensure user confirms addChain
      confirmation = await snap.request({
        method: "snap_dialog",
        params: {
          type: "confirmation",
          content: panel([
            heading("Confirm Chain Addition"),
            divider(),
            heading("Chain Info"),
            text(
              `${request.params.chain_info}`
            ),
          ]),
        },
      });
      if (!confirmation) {
        throw new Error("Chain addition was denied.")
      }

      let new_chain: Chain = JSON.parse(request.params.chain_info);

      let new_chains = await ChainState.addChain(new_chain);

      return {
        data: new_chains,
        success: true,
        statusCode: 201,
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

      // Ensure user confirms deleteChain
      confirmation = await snap.request({
        method: "snap_dialog",
        params: {
          type: "confirmation",
          content: panel([
            heading("Confirm Chain Deletion"),
            divider(),
            heading("Chain To Delete"),
            text(
              `${request.params.chain_id}`
            ),
          ]),
        },
      });
      if (!confirmation) {
        throw new Error("Chain deletion was denied.")
      }

      res = await ChainState.removeChain(request.params.chain_id);

      return {
        data: res,
        success: true,
        statusCode: 201,
      };
    case "getChains":
      // Get all chains from the wallet state
      res = await ChainState.getChains();

      return {
        data: res,
        success: true,
        statusCode: 200,
      };
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
            heading("Confirm Address Book Addition"),
            divider(),
            heading("Chain"),
            text(
              `${request.params.chain_id}`
            ),
            heading("Name"),
            text(
              `${request.params.name}`
            ),
            heading("Address"),
            text(
              `${request.params.address}`
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

      res = await AddressState.addAddress(new_address);

      return {
        data: res,
        success: true,
        statusCode: 201,
      };

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
            heading("Confirm Address Book Deletion"),
            divider(),
            heading("Address"),
            text(
              `${request.params.address}`
            ),
          ]),
        },
      });

      //If user declined confirmation, throw error
      if (!confirmation) {
        throw new Error("Delete address action declined");
      }

      res = await AddressState.removeAddress(request.params.address);

      return {
        data: res,
        success: true,
        statusCode: 201,
      };

    case "getAddresses":
      // Get all addresses from the address book in wallet state
      res = await AddressState.getAddressBook();

      return {
        data: res,
        success: true,
        statusCode: 200,
      };

    default:
      throw new Error("Method not found.");
  }
};
