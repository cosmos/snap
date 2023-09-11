import type { Chain } from '@cosmsnap/snapper';
import _ from 'lodash';
import { MongoClient, Db, Collection, type InsertOneResult } from 'mongodb';

if (!import.meta.env.VITE_MONGO_DB_URL) {
  throw new Error("VITE_MONGO_DB_URL is not set. Transaction indexing not on.");
}
export const mongoDbUrl = import.meta.env.VITE_MONGO_DB_URL;

export interface Transaction {
  address: string;
  chain: string;
  tx_hash: string;
  when: Date;
}

export async function fetchTransactions(chains: Chain[]): Promise<Transaction[]> {
  let client: MongoClient | null = null;

  try {
    client = new MongoClient(mongoDbUrl);
    console.log(client);
    await client.connect();

    const db: Db = client.db("transactions");
    const collection: Collection<Transaction> = db.collection("transactions");

    let addressList: (string | undefined)[] = [];
    if (chains) {
      addressList = _.map(chains, 'address');
    } else {
      return []
    }

    const filteredAddressList = addressList.filter(Boolean) as string[];

    if (filteredAddressList.length == 0) {
      return []
    }

    const filter = {
      address: {
        $in: filteredAddressList,
      },
    };

    const transactions = await collection.find(filter).toArray();

    return transactions;
  } catch (e) {
    console.error("An error occurred:", e);
    return [];
  } finally {
    if (client) {
      await client.close();
    }
  }
}

export async function addTransaction(transaction: Transaction): Promise<InsertOneResult<Transaction> | void> {
  let client: MongoClient | null = null;

  try {
    client = new MongoClient("mongodb://localhost:27017");
    await client.connect();

    const db: Db = client.db("your_database_name");
    const collection: Collection<Transaction> = db.collection("transactions");

    const result = await collection.insertOne(transaction);

    return result
  } catch (e) {
    console.error(e);
    throw e;
  } finally {
    if (client) {
      await client.close();
    }
  }
}