import type { Coin } from "@cosmjs/stargate";
import _ from "lodash";
import type { CoinIBC } from "./ibc";
import type { ChainInfo } from "@keplr-wallet/types";

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
  console.log("coin: ");
  console.log(coin);

  const ibc = coin.ibc;
  const ibc_denom = ibc ? coin.denom : undefined;
  const denom = coin.denom;
  const amount = coin.amount.toString();
  let display: string;

  if (ibc) {
    display = denom.toUpperCase().split("IBC/")[1];
  } else {
    display = denom.substring(1).toUpperCase();
  }

  const res: CoinIBC = {
    ibc,
    ibc_denom,
    denom,
    amount,
    display,
  };

  return res;
}

/**
 * Validates a ChainInfo addition
 * 
 * @param {ChainInfo} chainInfo - Chain info object
 * @returns {Boolean} - valid or not
 */
export function validateChainInfo(chainInfo: ChainInfo): boolean {

  if (!chainInfo) return false;

  // Validate top-level properties
  if (
    typeof chainInfo.chainId !== 'string' ||
    typeof chainInfo.chainName !== 'string' ||
    typeof chainInfo.rpc !== 'string' ||
    typeof chainInfo.nodeProvider?.email !== 'string' ||
    typeof chainInfo.nodeProvider?.name !== 'string' ||
    typeof chainInfo.nodeProvider?.website !== 'string' ||
    typeof chainInfo.rest !== 'string' ||
    typeof chainInfo.bip44 !== 'object' ||
    typeof chainInfo.bech32Config !== 'object' ||
    !Array.isArray(chainInfo.currencies) ||
    !Array.isArray(chainInfo.feeCurrencies) ||
    typeof chainInfo.stakeCurrency !== 'object'
  ) {
    return false;
  }

  // Validate bip44 object
  if (typeof chainInfo.bip44.coinType !== 'number') {
    return false;
  }

  // Validate bech32Config object
  const requiredBech32Keys = [
    'bech32PrefixAccAddr',
    'bech32PrefixAccPub',
    'bech32PrefixValAddr',
    'bech32PrefixValPub',
    'bech32PrefixConsAddr',
    'bech32PrefixConsPub',
  ];

  for (const key of requiredBech32Keys) {
    if (typeof (chainInfo.bech32Config as any)[key] !== 'string') {
      return false;
    }
  }

  // Validate currencies array
  for (const currency of chainInfo.currencies) {
    if (
      typeof currency.coinDenom !== 'string' ||
      typeof currency.coinMinimalDenom !== 'string' ||
      typeof currency.coinDecimals !== 'number' ||
      typeof currency.coinGeckoId !== 'string'
    ) {
      return false;
    }
  }

  // Validate feeCurrencies array
  for (const feeCurrency of chainInfo.feeCurrencies) {
    if (
      typeof feeCurrency.coinDenom !== 'string' ||
      typeof feeCurrency.coinMinimalDenom !== 'string' ||
      typeof feeCurrency.coinDecimals !== 'number' ||
      typeof feeCurrency.coinGeckoId !== 'string' ||
      typeof feeCurrency.gasPriceStep !== 'object'
    ) {
      return false;
    }

    // Validate gasPriceStep
    if (
      typeof feeCurrency.gasPriceStep.low !== 'number' ||
      typeof feeCurrency.gasPriceStep.average !== 'number' ||
      typeof feeCurrency.gasPriceStep.high !== 'number'
    ) {
      return false;
    }
  }

  // Validate stakeCurrency object
  if (
    typeof chainInfo.stakeCurrency.coinDenom !== 'string' ||
    typeof chainInfo.stakeCurrency.coinMinimalDenom !== 'string' ||
    typeof chainInfo.stakeCurrency.coinDecimals !== 'number' ||
    typeof chainInfo.stakeCurrency.coinGeckoId !== 'string'
  ) {
    return false;
  }

  return true;
}