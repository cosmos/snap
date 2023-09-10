import { MongoClient, Db, Collection, type InsertOneResult } from 'mongodb';

export interface Transaction {
  address: string;
  chain: string;
  tx_hash: string;
  when: Date;
}

export async function fetchTransactions(filter: Partial<Transaction>): Promise<Transaction[]> {
  let client: MongoClient | null = null;

  try {
    client = new MongoClient("mongodb://localhost:27017");
    await client.connect();

    const db: Db = client.db("your_database_name");
    const collection: Collection<Transaction> = db.collection("transactions");

    const transactions: Transaction[] = await collection.find(filter).toArray();

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