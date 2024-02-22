import { OnRpcRequestHandler } from "@metamask/snaps-types";
import { AccountData } from '@cosmjs/amino';
import { panel, text, heading, divider, copyable } from "@metamask/snaps-ui";
import { initializeChains } from "./initialize";
import { Chain, Chains, Fees, Msg } from "./types/chains";
import { Address } from "./types/address";
import { ChainState, AddressState } from "./state";
import { Result } from "./types/result";
import { sendTx, signAmino, signDirect, submitTransaction } from "./transaction";
import { COIN_TYPES, DEFAULT_FEES } from "./constants";
import { SignDoc, TxBody } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { StdSignDoc } from "@cosmjs/amino";
import { bigintReplacer, decodeProtoMessage, decodeTxBodyIntoMessages } from "./parser";
import Long from "long";
import { Key } from '@keplr-wallet/types';
import { fromBech32 } from '@cosmjs/encoding';
import { isTxBodyEncodeObject } from "@cosmjs/proto-signing";

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.request - A JSON-RPC request object that will be validated.
 * @returns A result object.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({
  request,
}): Promise<Result> => {
  let res: Object = {};
  switch (request.method) {
    case "initialized":
      let data = await snap.request({
        method: "snap_manageState",
        params: { operation: "get" },
      });

      if (data == null) {
        return {
          data: {
            initialized: false
          },
          success: true,
          statusCode: 200,
        };
      }

      return {
        data: {
          initialized: data.initialized
        },
        success: true,
        statusCode: 200,
      };
    case "initialize":
      // Ensure user confirms initializing Cosmos snap
      let confirmationInit = await snap.request({
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
      if (!confirmationInit) {
        throw new Error("Initialize Cosmos chain support was denied.");
      }
      // Make sure not initialized already
      let checkInit = await snap.request({
        method: "snap_manageState",
        params: { operation: "get" },
      });
      if (checkInit != null && checkInit.initialized) {
        await snap.request({
          method: "snap_dialog",
          params: {
            type: "alert",
            content: panel([
              heading("Already Initialized"),
              text(
                "The Cosmos Snap has already been initialized."
              ),
            ]),
          },
        });
        throw new Error("The Cosmos Snap has already been initialized.");
      };

      let chainList = await initializeChains();
      let chains = new Chains(chainList);
      // Initialize with initial state
      await snap.request({
        method: "snap_manageState",
        params: {
          operation: "update",
          newState: { chains: chains.string(), addresses: JSON.stringify([]), initialized: true, hd: (request.params && request.params.hd) ? request.params.hd : true },
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
        data: chains.chains,
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
      let fees: Fees = DEFAULT_FEES;

      if (request.params.fees) {
        if (typeof request.params.fees == "string") {
          fees = JSON.parse(request.params.fees);
        }
      }

      //Get messages if any from JSON string
      let messages: Msg[] = [];

      if (request.params.msgs) {
        if (typeof request.params.msgs == "string") {
          messages = JSON.parse(request.params.msgs);
        }
      }

      // create all msg prompts
      let uiTransact = [
        heading("Confirm Transaction"),
        divider(),
        heading("Chain"),
        text(`${request.params.chain_id}`),
        divider(),
        heading("Transaction"),
      ]

      messages.map((item) => {
        uiTransact.push(heading(item.typeUrl)),
        uiTransact.push(text(JSON.stringify(item.value, null, 2))),
        uiTransact.push(divider())
      });

      uiTransact.push(text("Fees"))
      uiTransact.push(text(JSON.stringify(fees, null, 4)))

      // Ensure user confirms transaction
      let confirmationTransact = await snap.request({
        method: "snap_dialog",
        params: {
          type: "confirmation",
          content: panel(uiTransact),
        },
      });

      if (!confirmationTransact) {
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
    case "sendTx":
      // Send a transaction to the wallet
      if (
        !(
          request.params != null &&
          typeof request.params == "object" &&
          "tx" in request.params &&
          "chain_id" in request.params &&
          typeof request.params.tx == "string" &&
          typeof request.params.chain_id == "string"
        )
      ) {
        throw new Error("Invalid sendTx request");
      }

      let txBytes: Uint8Array = JSON.parse(request.params.tx)

      let txResponse = await sendTx(request.params.chain_id, txBytes);

      if (typeof txResponse === "undefined") {
        return {
          data: {},
          success: false,
          statusCode: 500,
        };
      }

      if (txResponse.code === 0) {
        await snap.request({
          method: "snap_dialog",
          params: {
            type: "alert",
            content: panel([
              heading("Transaction Successful"),
              text(
                `Transaction with the hash ${txResponse.transactionHash} has been broadcasted to the chain ${request.params.chain_id}.`
              ),
              copyable(`${txResponse.transactionHash}`),
            ]),
          },
        });

        return {
          data: txResponse,
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
              text(txResponse.rawLog!),
              copyable(`${txResponse.transactionHash}`),
            ]),
          },
        });

        return {
          data: txResponse,
          success: false,
          statusCode: 500,
        };
      }
    case "signDirect":
      // Sign a transaction with the wallet
      if (
        !(
          request.params != null &&
          typeof request.params == "object" &&
          "sign_doc" in request.params &&
          "chain_id" in request.params &&
          "signer" in request.params &&
          typeof request.params.chain_id == "string" &&
          typeof request.params.signer == "string"
        )
      ) {
        throw new Error("Invalid signDirect request");
      }

      let signDoc: SignDoc = request.params.sign_doc as unknown as SignDoc;
      let {low, high, unsigned} = signDoc.accountNumber
      let accountNumber = new Long(low, high, unsigned);
      let signDocNew: SignDoc = {
        accountNumber,
        bodyBytes: new Uint8Array(Object.values(signDoc.bodyBytes)),
        authInfoBytes: new Uint8Array(Object.values(signDoc.authInfoBytes)),
        chainId: signDoc.chainId
      }
      let txBody = TxBody.decode(signDocNew.bodyBytes);
      const msgs = [];
      
      for (const msg of txBody.messages) {
        if (isTxBodyEncodeObject(msg)) {
          const messages = await decodeTxBodyIntoMessages(msg.typeUrl, msg.value);
          for (const message of messages) {
            let decMsgTxBody = await decodeProtoMessage(message.typeUrl, message.value);
            msgs.push(decMsgTxBody);
          }
          continue;
        }
        let decMsg = await decodeProtoMessage(msg.typeUrl, msg.value);
        msgs.push(decMsg);
      }

      // create all msg prompts
      let ui = [
        heading("Confirm Transaction"),
        divider(),
        heading("Chain"),
        text(`${request.params.chain_id}`),
        divider(),
        heading("Transactions"),
      ]

      msgs.map(item => {
        ui.push(divider())
        ui.push(heading(item.typeUrl))
        if (item.value == null) {
          ui.push(text('Blind signing. ***Proceed with caution!***'))
        } else {
          ui.push(text(JSON.stringify(bigintReplacer(item.value), null, 2)))
        }
      });

      if (txBody.memo) {
        ui.push(divider())
        ui.push(heading("Memo"))
        ui.push(text(txBody.memo))
      }

      // Ensure user confirms transaction
      let confirmationDirect = await snap.request({
        method: "snap_dialog",
        params: {
          type: "confirmation",
          content: panel(ui),
        },
      });

      if (!confirmationDirect) {
        throw new Error("Transaction was denied.");
      }

      let newSignDoc: SignDoc = {
        bodyBytes: new Uint8Array(Object.values(signDoc.bodyBytes)),
        authInfoBytes: new Uint8Array(Object.values(signDoc.authInfoBytes)),
        chainId: signDoc.chainId,
        accountNumber: new Long(signDoc.accountNumber.low, signDoc.accountNumber.high, signDoc.accountNumber.unsigned)
      }

      let resultTx = await signDirect(
        request.params.chain_id,
        request.params.signer,
        newSignDoc
      );

      if (typeof resultTx === "undefined") {
        return {
          data: {},
          success: false,
          statusCode: 500,
        };
      }

      return {
        data: resultTx,
        success: true,
        statusCode: 201,
      };
    case "signAmino":
      // Sign a transaction with the wallet
      if (
        !(
          request.params != null &&
          typeof request.params == "object" &&
          "sign_doc" in request.params &&
          "chain_id" in request.params &&
          "signer" in request.params &&
          typeof request.params.chain_id == "string" &&
          typeof request.params.signer == "string"
        )
      ) {
        throw new Error("Invalid signAmino request");
      }

      let signDocAmino: StdSignDoc = request.params.sign_doc as unknown as StdSignDoc;

      // create all msg prompts
      let uiAmino = [
        heading("Confirm Transaction"),
        heading("Chain"),
        text(`${request.params.chain_id}`),
        divider(),
        heading("Transactions"),
        divider(),
      ]

      signDocAmino.msgs.map(item => {
        ui.push(heading(item.type)),
        ui.push(text(JSON.stringify(bigintReplacer(item.value), null, 2))),
        ui.push(divider())
      });

      // Ensure user confirms transaction
      let confirmationSignAmino = await snap.request({
        method: "snap_dialog",
        params: {
          type: "confirmation",
          content: panel(uiAmino),
        },
      });

      if (!confirmationSignAmino) {
        throw new Error("Transaction was denied.");
      }

      let resultTxAmino = await signAmino(
        request.params.chain_id,
        request.params.signer,
        signDocAmino
      );

      if (typeof resultTxAmino === "undefined") {
        return {
          data: {},
          success: false,
          statusCode: 500,
        };
      }

      return {
        data: resultTxAmino,
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
      let confirmAddChain = await snap.request({
        method: "snap_dialog",
        params: {
          type: "confirmation",
          content: panel([
            heading("Confirm Chain Addition"),
            divider(),
            heading("Chain Info"),
            text(`${JSON.stringify(new_chain, null, 4)}`),
          ]),
        },
      });
      if (!confirmAddChain) {
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

      // Ensure the coin type is supported (NOTE: 60 is blocked by Metamask)
      if (!COIN_TYPES.includes(new_chain.slip44)) {
        await snap.request({
          method: "snap_dialog",
          params: {
            type: "alert",
            content: panel([
              heading("Error Occured"),
              text(`Coin type ${new_chain.slip44} is not supported.`),
            ]),
          },
        });
        throw new Error(
          `Coin type ${new_chain.slip44} is not supported.`
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
      let confirmDeleteChain = await snap.request({
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
      if (!confirmDeleteChain) {
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
      let confirmAddAddress = await snap.request({
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
      if (!confirmAddAddress) {
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
      let confirmDeleteAddress = await snap.request({
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
      if (!confirmDeleteAddress) {
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
    case "getAccountInfo":  
      if (
        !(
          request.params != null &&
          typeof request.params == "object" &&
          "chain_id" in request.params &&
          typeof request.params.chain_id == "string"
        )
      ) {
        throw new Error("Invalid getAccountInfo request");
      }

      let account: AccountData = await ChainState.GetAccount(request.params.chain_id);

      return {
        data: {
          algo: 'secp256k1',
          address: account.address,
          pubkey: new Uint8Array(Object.values(account.pubkey)),
        },
        success: true,
        statusCode: 200,
      };

    case "getKey":  
      if (
        !(
          request.params != null &&
          typeof request.params == "object" &&
          "chain_id" in request.params &&
          typeof request.params.chain_id == "string"
        )
      ) {
        throw new Error("Invalid getKey request");
      }

      let accountKey: AccountData = await ChainState.GetAccount(request.params.chain_id);
      const bechInfo = fromBech32(accountKey.address);
      const addressBytes = Uint8Array.from(bechInfo.data);

      let key: Key = {
        algo: 'secp256k1',
        address: addressBytes,
        pubKey: new Uint8Array(Object.values(accountKey.pubkey)),
        bech32Address: accountKey.address,
        name: "Cosmos MetaMask Extension",
        isNanoLedger: false,
        isKeystone: false
      }

      return {
        data: key,
        success: true,
        statusCode: 200,
    };

    case "txAlert":

      if (
        !(
          request.params != null &&
          typeof request.params == "object" &&
          "chain_id" in request.params &&
          "hash" in request.params &&
          typeof request.params.chain_id == "string" &&
          typeof request.params.hash == "string"
        )
      ) {
        throw new Error("Invalid txAlert request");
      }

      let hash: string = request.params.hash;

      await snap.request({
        method: "snap_dialog",
        params: {
          type: "alert",
          content: panel([
            heading("Transaction Successful"),
            text(
              `Transaction with the hash ${hash} has been broadcasted to the chain ${request.params.chain_id}.`
            ),
            copyable(`${hash}`),
          ]),
        },
      });
      return {
        data: {},
        success: true,
        statusCode: 200,
      };      

    default:
      throw new Error("Method not found.");
  }
};
