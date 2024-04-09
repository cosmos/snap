import { isTxBodyEncodeObject } from "@cosmjs/proto-signing";
import { SignDoc, TxBody } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import Long from "long";
import { bigintReplacer, decodeProtoMessage, decodeTxBodyIntoMessages } from "./parser";
import { panel, text, heading, divider } from "@metamask/snaps-sdk";
import { signDirect } from "./transaction";
import { createMultiSigTx, getMultisigTx, getPubKeyFromAddress, signMultiSigTx } from "./utils";
import { ChainState } from "./state";
import { WALLET_URL } from "./constants";
import { StdFee } from "@cosmjs/stargate";

export interface CreateMultisigRequest {
    params: {
        sign_doc: SignDoc;
        chain_id: string;
        signer: string;
        multisig: string;
        fee: StdFee;
    }
}
export const createMultisigTx = async (request: CreateMultisigRequest) => {
    try {
        if (
            !(
            request.params != null &&
            typeof request.params == "object" &&
            "sign_doc" in request.params &&
            "chain_id" in request.params &&
            "signer" in request.params &&
            "multisig" in request.params &&
            "fee" in request.params &&
            typeof request.params.chain_id == "string" &&
            typeof request.params.signer == "string" &&
            typeof request.params.multisig == "string"
            )
        ) {
            throw new Error("Invalid createMultiSigTx request");
        }

        // Check if there is a pending tx for the multisig wallet and if so direct the user to sign it before creating a new one
        const pendingTx = await getMultisigTx(request.params.multisig);
        if (pendingTx) {
            await snap.request({
                method: "snap_dialog",
                params: {
                    type: "alert",
                    content: panel([
                    heading("Pending Transaction"),
                    text(`There is a pending transaction for the multisig wallet ${request.params.multisig}. Please have multisig members sign and submit this tx first before creating a new one.`),
                    text(`Sign the pending transaction [here](https://akash.mysticlabs.xyz/${request.params.multisig}).`),
                    ]),
                },
            });
            return {
                data: {},
                success: false,
                statusCode: 400,
            };
        }

        let signDocMultisig: SignDoc = request.params.sign_doc as unknown as SignDoc;
        let {low: lowMultisig, high: highMultisig, unsigned: unsignedMultisig} = signDocMultisig.accountNumber
        let accountNumberMultisig = new Long(lowMultisig, highMultisig, unsignedMultisig);
        let signDocNewMultisig: SignDoc = {
            accountNumber: accountNumberMultisig,
            bodyBytes: new Uint8Array(Object.values(signDocMultisig.bodyBytes)),
            authInfoBytes: new Uint8Array(Object.values(signDocMultisig.authInfoBytes)),
            chainId: signDocMultisig.chainId
        }
        let txBodyMultisig = TxBody.decode(signDocNewMultisig.bodyBytes);
        const msgsMultisig = [];
        
        for (const msg of txBodyMultisig.messages) {
            if (isTxBodyEncodeObject(msg)) {
            const messages = await decodeTxBodyIntoMessages(msg.typeUrl, msg.value);
            for (const message of messages) {
                let decMsgTxBody = await decodeProtoMessage(message.typeUrl, message.value);
                msgsMultisig.push(decMsgTxBody);
            }
            continue;
            }
            let decMsg = await decodeProtoMessage(msg.typeUrl, msg.value);
            msgsMultisig.push(decMsg);
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

        msgsMultisig.map(item => {
            ui.push(divider())
            ui.push(heading(item.typeUrl))
            if (item.value == null) {
            ui.push(text('Blind signing. ***Proceed with caution!***'))
            } else {
            ui.push(text(JSON.stringify(bigintReplacer(item.value), null, 2)))
            }
        });

        if (txBodyMultisig.memo) {
            ui.push(divider())
            ui.push(heading("Memo"))
            ui.push(text(txBodyMultisig.memo))
        }

        // Ensure user confirms transaction
        let confirmationDirectMultisig = await snap.request({
            method: "snap_dialog",
            params: {
            type: "confirmation",
            content: panel(ui),
            },
        });

        if (!confirmationDirectMultisig) {
            throw new Error("Transaction was denied.");
        }

        let newSignDocMultisig: SignDoc = {
            bodyBytes: new Uint8Array(Object.values(signDocMultisig.bodyBytes)),
            authInfoBytes: new Uint8Array(Object.values(signDocMultisig.authInfoBytes)),
            chainId: signDocMultisig.chainId,
            accountNumber: new Long(signDocMultisig.accountNumber.low, signDocMultisig.accountNumber.high, signDocMultisig.accountNumber.unsigned)
        }

        let resultTxMultisig = await signDirect(
            request.params.chain_id,
            request.params.signer,
            newSignDocMultisig
        );

        if (!resultTxMultisig) {
            await snap.request({
                method: "snap_dialog",
                params: {
                    type: "alert",
                    content: panel([
                    heading("Error Occured"),
                    text(`Failed to sign transaction for multisig wallet ${request.params.multisig}.`),
                    ]),
                },
            });
            return {
                data: {},
                success: false,
                statusCode: 500,
            };
        }

        const chain = await ChainState.getChain(request.params.chain_id);
        if (!chain) {
            throw new Error(
            `Chain ${request.params.chain_id} not found. Please go to ${WALLET_URL} to add it!`
            );
        }

        const rpc = chain.apis.rpc[0].address;

        // Lookup the multisig address to get multisig public key and check if it exists on chain
        const pubKey = await getPubKeyFromAddress(request.params.multisig, request.params.chain_id, rpc);

        const response = await createMultiSigTx(request.params.chain_id, JSON.stringify(msgsMultisig), resultTxMultisig.signature.signature, pubKey.value, rpc, chain.bech32_prefix, request.params.signer, request.params.fee);

        return {
            data: response,
            success: true,
            statusCode: 201,
        };
    } catch (error: any) {
        await snap.request({
            method: "snap_dialog",
            params: {
                type: "alert",
                content: panel([
                heading("Error Occured"),
                text(`Failed to create transaction for multisig wallet ${request.params.multisig}.`),
                text(error.message),
                ]),
            },
        });
        return {
            data: {},
            success: false,
            statusCode: 500,
        };
    }
};

interface SignDirectMultisigRequest {
    params: {
        sign_doc: SignDoc;
        chain_id: string;
        signer: string;
        multisig: string;
    }
}
export const signDirectMultisig = async (request: SignDirectMultisigRequest) => {
    try {
        if (
            !(
            request.params != null &&
            typeof request.params == "object" &&
            "sign_doc" in request.params &&
            "chain_id" in request.params &&
            "signer" in request.params &&
            "multisig" in request.params &&
            typeof request.params.chain_id == "string" &&
            typeof request.params.signer == "string" &&
            typeof request.params.multisig == "string"
            )
        ) {
            throw new Error("Invalid signDirectMultisig request");
        }

        let signDocMultisig: SignDoc = request.params.sign_doc as unknown as SignDoc;
        let {low: lowMultisig, high: highMultisig, unsigned: unsignedMultisig} = signDocMultisig.accountNumber
        let accountNumberMultisig = new Long(lowMultisig, highMultisig, unsignedMultisig);
        let signDocNewMultisig: SignDoc = {
            accountNumber: accountNumberMultisig,
            bodyBytes: new Uint8Array(Object.values(signDocMultisig.bodyBytes)),
            authInfoBytes: new Uint8Array(Object.values(signDocMultisig.authInfoBytes)),
            chainId: signDocMultisig.chainId
        }
        let txBodyMultisig = TxBody.decode(signDocNewMultisig.bodyBytes);
        const msgsMultisig = [];
        
        for (const msg of txBodyMultisig.messages) {
            if (isTxBodyEncodeObject(msg)) {
            const messages = await decodeTxBodyIntoMessages(msg.typeUrl, msg.value);
            for (const message of messages) {
                let decMsgTxBody = await decodeProtoMessage(message.typeUrl, message.value);
                msgsMultisig.push(decMsgTxBody);
            }
            continue;
            }
            let decMsg = await decodeProtoMessage(msg.typeUrl, msg.value);
            msgsMultisig.push(decMsg);
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

        msgsMultisig.map(item => {
            ui.push(divider())
            ui.push(heading(item.typeUrl))
            if (item.value == null) {
            ui.push(text('Blind signing. ***Proceed with caution!***'))
            } else {
            ui.push(text(JSON.stringify(bigintReplacer(item.value), null, 2)))
            }
        });

        if (txBodyMultisig.memo) {
            ui.push(divider())
            ui.push(heading("Memo"))
            ui.push(text(txBodyMultisig.memo))
        }

        // Ensure user confirms transaction
        let confirmationDirectMultisig = await snap.request({
            method: "snap_dialog",
            params: {
            type: "confirmation",
            content: panel(ui),
            },
        });

        if (!confirmationDirectMultisig) {
            throw new Error("Transaction was denied.");
        }

        let newSignDocMultisig: SignDoc = {
            bodyBytes: new Uint8Array(Object.values(signDocMultisig.bodyBytes)),
            authInfoBytes: new Uint8Array(Object.values(signDocMultisig.authInfoBytes)),
            chainId: signDocMultisig.chainId,
            accountNumber: new Long(signDocMultisig.accountNumber.low, signDocMultisig.accountNumber.high, signDocMultisig.accountNumber.unsigned)
        }

        let resultTx = await signDirect(
            request.params.chain_id,
            request.params.signer,
            newSignDocMultisig
        );

        if (typeof resultTx === "undefined") {
            return {
                data: {},
                success: false,
                statusCode: 500,
            };
        }

        const chain = await ChainState.getChain(request.params.chain_id);
        if (!chain) {
            throw new Error(
            `Chain ${request.params.chain_id} not found. Please go to ${WALLET_URL} to add it!`
            );
        }

        const rpc = chain.apis.rpc[0].address;

        // Lookup the multisig address to get multisig public key and check if it exists on chain
        const pubKey = await getPubKeyFromAddress(request.params.multisig, request.params.chain_id, rpc);

        // Lookup the multisig transaction in appwrite for fee
        const multisigTx = await getMultisigTx(request.params.multisig);

        // Sign the multisig transaction in appwrite
        const response = await signMultiSigTx(JSON.stringify(pubKey), rpc, multisigTx.fee, chain.bech32_prefix, resultTx.signature);
        if (!response.success) {
            throw new Error(response.data);
        }

        return {
            data: response,
            success: true,
            statusCode: 201,
        };
    } catch (error: any) {
        await snap.request({
            method: "snap_dialog",
            params: {
                type: "alert",
                content: panel([
                heading("Error Occured"),
                text(`Failed to create transaction for multisig wallet ${request.params.multisig}.`),
                text(error.message),
                ]),
            },
        });
        return {
            data: {},
            success: false,
            statusCode: 500,
        };
    }
};

interface GetMultisigTxRequest {
    params: {
        multisig: string;
    }
}
export const getMultiSigTx = async (request: GetMultisigTxRequest) => {
    return {
        data: {},
        success: true,
        statusCode: 200,
    }
};

interface GetMultisigsRequest {
    params: {
        signer_address: string;
    }
}
export const getMultisigs = async (request: GetMultisigsRequest) => {
    return {
        data: {},
        success: true,
        statusCode: 200,
    }
};