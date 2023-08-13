import { OnRpcRequestHandler } from "@metamask/snaps-types";
import { panel, text, heading, divider, copyable } from "@metamask/snaps-ui";
import { initializeChains } from "./initialize";
import { Chain, Chains, Fees } from "./types/chains";
import { Address } from "./types/address";
import { ChainState, AddressState } from "./state";
import { Result } from "./types/result";
import { submitTransaction } from "./transaction";
import { getAddress } from "./address";

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
        throw new Error("Initialize Cosmos chain support was denied.");
      }
      let chains = new Chains([]);
      let chainList = await initializeChains();
      chains = new Chains(chainList);
      // Initialize with initial state
      await snap.request({
        method: "snap_manageState",
        params: {
          operation: "update",
          newState: { chains: chains.string(), addresses: JSON.stringify([]) },
        },
      });

      await snap.request({
        method: "snap_dialog",
        params: {
          type: "alert",
          content: panel([
            heading("Initialization Successful"),
            text(
              "Cosmos has been added and initialized into your Metamask wallet."
            ),
          ]),
        },
      });

      return {
        data: res,
        success: true,
        statusCode: 201,
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

      //Calculate fees for transaction
      let fees: Fees = {
        amount: [],
        gas: "200000",
      };

      if (request.params.fees) {
        if (typeof request.params.fees == "string") {
          fees = JSON.parse(request.params.fees);
        }
      }

      //Get messages if any from JSON string
      let messages;

      if (request.params.msgs) {
        if (typeof request.params.msgs == "string") {
          messages = JSON.parse(request.params.msgs);
        }
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
            text(`${request.params.chain_id}`),
            divider(),
            heading("Transaction"),
            text(`${messages}`),
            heading("Fees Amount"),
            text(`${fees}`),
          ]),
        },
      });

      if (!confirmation) {
        throw new Error("Transaction was denied.");
      }

      let result = await submitTransaction(
        request.params.chain_id,
        messages,
        fees
      );

      if (typeof result === "undefined") {
        return {
          data: {},
          success: false,
          statusCode: 500,
        };
      }

      if (result.code === 0) {
        await snap.request({
          method: "snap_dialog",
          params: {
            type: "alert",
            content: panel([
              heading("Transaction Successful"),
              text(
                `Transaction with the hash ${result.transactionHash} has been broadcasted to the chain ${request.params.chain_id}.`
              ),
              copyable(`${result.transactionHash}`),
            ]),
          },
        });

        return {
          data: result,
          success: true,
          statusCode: 201,
        };
      } else {
        await snap.request({
          method: "snap_dialog",
          params: {
            type: "alert",
            content: panel([
              heading("Transaction Failed"),
              text(result.rawLog!),
              copyable(`${result.transactionHash}`),
            ]),
          },
        });

        return {
          data: result,
          success: false,
          statusCode: 500,
        };
      }
    case "addChain":
      if (
        !(
          request.params != null &&
          typeof request.params == "object" &&
          "chain_info" in request.params &&
          typeof request.params.chain_info == "string"
        )
      ) {
        throw new Error("Invalid addChain request");
      }

      //Get Chain info from JSON string
      let new_chain: Chain = JSON.parse(request.params.chain_info);

      if (
        !(
          "chain_name" in new_chain &&
          "chain_id" in new_chain &&
          typeof new_chain.chain_name == "string" &&
          typeof new_chain.chain_id == "string"
        )
      ) {
        throw new Error("Invalid Chain Info");
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
            text(`${new_chain}`),
          ]),
        },
      });
      if (!confirmation) {
        throw new Error("Chain addition was denied.");
      }

      // Ensure chain id doesn't already exist
      let get_chain = await ChainState.getChain(new_chain.chain_id);
      
      if (get_chain != null) {
        await snap.request({
          method: "snap_dialog",
          params: {
            type: "alert",
            content: panel([
              heading("Error Occured"),
              text(`Chain with Chain Id ${new_chain.chain_id} already exists.`),
            ]),
          },
        });
        throw new Error(
          `Chain with Chain Id ${new_chain.chain_id} already exists.`
        );
      }

      let new_chains = await ChainState.addChain(new_chain);

      await snap.request({
        method: "snap_dialog",
        params: {
          type: "alert",
          content: panel([
            heading("Chain Added"),
            text(
              `The chain ${new_chain.chain_id} has been added to your wallet.`
            ),
          ]),
        },
      });

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
            text(`${request.params.chain_id}`),
          ]),
        },
      });
      if (!confirmation) {
        throw new Error("Chain deletion was denied.");
      }

      res = await ChainState.removeChain(request.params.chain_id);

      await snap.request({
        method: "snap_dialog",
        params: {
          type: "alert",
          content: panel([
            heading("Chain Removed"),
            text(
              `The chain ${request.params.chain_id} has been removed from your wallet.`
            ),
          ]),
        },
      });

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
            text(`${request.params.chain_id}`),
            heading("Name"),
            text(`${request.params.name}`),
            heading("Address"),
            text(`${request.params.address}`),
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

      await snap.request({
        method: "snap_dialog",
        params: {
          type: "alert",
          content: panel([
            heading("Address Added"),
            text(
              `The address ${request.params.address} has been added to your wallet address book for chain ${request.params.chain_id} as ${request.params.name}.`
            ),
          ]),
        },
      });

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
            text(`${request.params.address}`),
          ]),
        },
      });

      //If user declined confirmation, throw error
      if (!confirmation) {
        throw new Error("Delete address action declined");
      }

      res = await AddressState.removeAddress(request.params.address);

      await snap.request({
        method: "snap_dialog",
        params: {
          type: "alert",
          content: panel([
            heading("Address Deleted"),
            text(
              `The address ${request.params.address} has been deleted from your wallets address book.`
            ),
          ]),
        },
      });

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
    case "getChainAddress":
      if (
        !(
          request.params != null &&
          typeof request.params == "object" &&
          "chain_id" in request.params &&
          typeof request.params.chain_id == "string"
        )
      ) {
        throw new Error("Invalid getChainAddress request");
      }

      let address = await ChainState.getChainAddress(request.params.chain_id);

      return {
        data: {
          address: address,
          chain_id: request.params.chain_id,
        },
        success: true,
        statusCode: 200,
      };
    case "getChainAddresses":
      let addresses = await ChainState.getChainAddresses();

      return {
        data: {
          addresses: addresses,
        },
        success: true,
        statusCode: 200,
      };

    default:
      throw new Error("Method not found.");
  }
};
