import { Coin } from "@cosmjs/amino";
import { Chain } from "./types/chains";

if (!process.env.DENO_SERVERLESS_URL) {
  throw new Error("DENO_SERVERLESS_URL not set...");
}
export const denoUrl = process.env.DENO_SERVERLESS_URL;

export interface CoinIBC extends Coin {
  ibc: boolean;
  ibc_denom?: string;
  display: string;
}

export interface ChainBalances extends Chain {
    balances: CoinIBC[];
}

export const getBalances = async (chains: Chain[]): Promise<ChainBalances[]> => {
    try {
        const res = await fetch(`${denoUrl}/balances`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
            body: JSON.stringify({ chains: chains })
        });

        if (!res.ok) {
            throw new Error(`HTTP error ${res.status}`);
        }

        const data = await res.json();

        return data.balances;
    } catch (error) {
        console.error(error);
        throw error;
    }
};