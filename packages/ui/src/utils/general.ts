import type { Coin } from "@cosmjs/stargate";
import _ from "lodash";
import type { CoinIBC } from "./ibc";

export const LOCAL_STORAGE_CHAINS = "cosmsnap:chains";
export const LOCAL_STORAGE_INIT = "cosmsnap:initialized";

export const copyToClipboard = async (text: string): Promise<void> => {
    if (text === null || text === undefined) {
        return;
    }

    try {
        await navigator.clipboard.writeText(text);
    } catch (err) {
        console.error(err);
        throw err
    }
};

export interface Transaction {
    address: string;
    chain: string;
    tx_hash: string;
    when: Date;
}

/**
 * Make a coin object presentable for display
 * 
 * @param {Coin} coin - The coin object 
 * @returns {Object} - The presentable coin object
 */
export const makeCoinPresentable = (coin: CoinIBC): CoinIBC => {
    let ibcSplit = coin.denom.toUpperCase().split("IBC/");
    if (ibcSplit.length > 1) {
        return {
            ibc: true,
            ibc_denom: coin.ibc_denom,
            denom: coin.denom.toUpperCase(),
            amount: _.round(Number(coin.amount)/1000000, 2).toString()
        }
    }
    return {
        ibc: false,
        ibc_denom: coin.ibc_denom,
        denom: coin.denom.substring(1).toUpperCase(),
        amount: _.round(Number(coin.amount)/1000000, 2).toString()
    }
}