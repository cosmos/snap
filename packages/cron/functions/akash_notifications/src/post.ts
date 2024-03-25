import { Query, Models } from "https://deno.land/x/appwrite@7.0.0/mod.ts";
import { AKASH_LEASE, AKASH_NOTIFICATION, DB_LEASE_RETURN, DB_NOTIFICATION_RETURN, NOTIFICATIONS_COLLECTION_NAME, OPEN_LEASE_COLLECTION_NAME, RESOURCE, RequestBody, apiUrl } from "./types.ts";
import { db } from "./types.ts";

// deno-lint-ignore no-explicit-any
export const postNotification = async (context: any) => {
  const { address } = JSON.parse(context.req.bodyRaw) as RequestBody;

  if (!address) {
    throw new Error("Missing address in request body");
  }

  context.log(`Updating Akash leases for ${address}`);

  // Keep track of docs added
  const docsAdded: Models.Document[] = [];

  // Pagination variables for the API request
  let currentOffset = 0;
  const pageLimit = 1000;

  // fetch all open akash leases
  while (true) {
    // Set parameters for the only open leases
    const params = {
      "filters.owner": address,
      "pagination.limit": pageLimit,
      "pagination.count_total": true,
      "pagination.offset": currentOffset,
    };

    // get current set of open leases
    const response = await fetch(apiUrl!, {
      body: JSON.stringify(params),
    });

    // check if API call was successful
    if (response.status === 200) {
      // Parse the response data
      const data = await response.json();
      const deployments = data.deployments;

      // deno-lint-ignore no-explicit-any
      const leases: AKASH_LEASE[] = deployments.map((deployment: any) => ({
        lease_id: deployment.deployment.deployment_id.dseq,
        state: deployment.deployment.state,
        address: deployment.deployment.deployment_id.owner,
      }));
      context.log(`Leases: ${JSON.stringify(leases)}`);

      const leaseReturn: DB_LEASE_RETURN = await db.listDocuments(
        RESOURCE,
        OPEN_LEASE_COLLECTION_NAME,
        [Query.equal("address", address)],
      ) as unknown as DB_LEASE_RETURN;
      const currentLeases = leaseReturn.documents;
      context.log(`Current leases: ${JSON.stringify(currentLeases)}`);

      // Check which leases have there status changed and add notifications to it if changed
      for (const lease of leases) {
        const foundLease = currentLeases.filter(
          (d) => d.lease_id === lease.lease_id,
        );
        context.log(`Found leases: ${JSON.stringify(foundLease)}`);
        if (foundLease.length > 0) {
          if (foundLease[0].state !== lease.state) {
            const notifAdd: AKASH_NOTIFICATION = {
              read: false,
              address: lease.address,
              lease: lease.lease_id,
              notification:
                `Lease ${lease.lease_id} status has changed to ${lease.state}.`,
              timestamp: Date.now(),
              type: lease.state,
            };

            // Check if we have sent this notification already, (do not compare timestamp or read)
            const notifReturn: DB_NOTIFICATION_RETURN = await db.listDocuments(
              RESOURCE,
              NOTIFICATIONS_COLLECTION_NAME,
              [
                Query.equal("address", lease.address),
                Query.equal("lease", lease.lease_id),
                Query.equal(
                  "notification",
                  `Lease ${lease.lease_id} status has changed to ${lease.state}.`,
                ),
                Query.equal("type", lease.state),
              ],
            ) as unknown as DB_NOTIFICATION_RETURN;

            // Add the notification if it does not exist
            if (notifReturn.documents.length === 0) {
              context.log(`Adding notification for lease ${lease.lease_id}.`);
              const res = await db.createDocument(
                RESOURCE,
                NOTIFICATIONS_COLLECTION_NAME,
                crypto.randomUUID(),
                notifAdd,
              );
              docsAdded.push(res);
            } else {
              context.log(
                `Notification for lease ${lease.lease_id} already exists.`,
              );
            }
          }
          // Since we already have the lease in the database, we can update it
          await db.updateDocument(
            RESOURCE,
            OPEN_LEASE_COLLECTION_NAME,
            lease.lease_id,
            lease,
          );
        } else {
          context.log(`Adding lease ${JSON.stringify(lease)} to the database.`);
          // If we have not found the lease, we add it to the database
          await db.createDocument(
            RESOURCE,
            OPEN_LEASE_COLLECTION_NAME,
            lease.lease_id,
            lease,
          );
        }
      }

      //update pagination info
      const paginationTotal = data.pagination.total;
      currentOffset += pageLimit;

      // Break the loop if we have reached the last page
      if (currentOffset >= paginationTotal) {
        break;
      }
    } else {
      throw new Error(
        `API call to cosmos failed with status code: ${response.status}`,
      );
    }
  }
  context.log(`Documents Added: ${JSON.stringify(docsAdded)}`);
  const res = {
    total: docsAdded.length,
    data: docsAdded,
    success: true
  };
  return res;
};
