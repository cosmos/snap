import { Query } from "https://deno.land/x/appwrite@7.0.0/mod.ts";
import { db } from "./types.ts";
import { DB_MULTISIG_RETURN, RESOURCE, MULTISIG_COLLECTION_NAME } from "./types.ts";

// deno-lint-ignore no-explicit-any
export const getMultisigs = async (context: any) => {
    const { address } = context.req.query;
    if (!address) {
        throw new Error("Missing address in request query");
    }
    const ret: DB_MULTISIG_RETURN = await db.listDocuments(
        RESOURCE,
        MULTISIG_COLLECTION_NAME,
        [
          Query.equal("akash_address", address),
        ],
      ) as unknown as DB_MULTISIG_RETURN;
    
      context.log(`Multisigs: ${JSON.stringify(ret.documents)}`);
      const res = {
        total: ret.total,
        data: ret.documents,
        success: true
      };
      return res
}