import { Query } from "https://deno.land/x/appwrite@10.0.0/mod.ts";
import { db } from "./types.ts";
import { DB_NOTIFICATION_RETURN, NOTIFICATIONS_COLLECTION_NAME, RESOURCE } from "./types.ts";

// deno-lint-ignore no-explicit-any
export const getNotifications = async (context: any) => {
    const { address } = context.req.query;
    if (!address) {
        throw new Error("Missing address in request query");
    }
    const notifReturn: DB_NOTIFICATION_RETURN = await db.listDocuments(
        RESOURCE,
        NOTIFICATIONS_COLLECTION_NAME,
        [
          Query.equal("address", address),
        ],
      ) as unknown as DB_NOTIFICATION_RETURN;
    
      context.log(`Notifications: ${JSON.stringify(notifReturn.documents)}`);
      const res = {
        total: notifReturn.total,
        data: notifReturn.documents,
        success: true
      };
      return res
}