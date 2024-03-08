import { Query, Client, Databases, Models } from "https://deno.land/x/appwrite@7.0.0/mod.ts";

enum Status {
  ACTIVE = "active",
  OPEN = "open",
  CLOSED = "closed",
  PAUSED = "paused",
  OVERDRAWN = "overdrawn",
  INSUFFIENCT = "insufficient_funds",
  INVALID = "invalid",
}

interface AKASH_LEASE {
  lease_id: string;
  state: Status;
  address: string;
}

interface AKASH_NOTIFICATION {
  read: boolean;
  address: string;
  lease: string;
  notification: string;
  timestamp: number;
  type: Status;
}

interface DB_NOTIFICATION_RETURN {
  total: number;
  documents: AKASH_NOTIFICATION[];
}

interface DB_LEASE_RETURN {
  total: number;
  documents: AKASH_LEASE[];
}

const RESOURCE = "akash";
const OPEN_LEASE_COLLECTION_NAME = "open_leases";
const NOTIFICATIONS_COLLECTION_NAME = "notifications";

const apiUrl = Deno.env.get("AKASH_API_URL");
if (!apiUrl) {
  throw new Error("The environment variable AKASH_API_URL is not set.");
}

const appwriteKey = Deno.env.get("APPWRITE_KEY");
if (!appwriteKey) {
  throw new Error("The environment variable APPWRITE_KEY is not set.");
}
const appwrite_url = Deno.env.get("APPWRITE_URL");
if (!appwrite_url) {
  throw new Error("APPWRITE_URL is not defined");
}
const project_id = Deno.env.get("APPWRITE_FUNCTION_PROJECT_ID");
if (!project_id) {
  throw new Error("APPWRITE_FUNCTION_PROJECT_ID is not defined");
}

const client = new Client()
  .setEndpoint(appwrite_url)
  .setProject(project_id)
  .setKey(appwriteKey);

const db = new Databases(client);

// deno-lint-ignore no-explicit-any
export async function main(context: any) {
  if (context.req.method !== "POST") {
    context.error(`Invalid HTTP method ${context.req.method}`);
    throw new Error("Invalid HTTP method");
  }

  const body = await context.req.json();
  context.log(`Request body: ${JSON.stringify(body)}`);

  if (!body.address) {
    context.error("Missing address in request body");
    throw new Error("Missing address in request body");
  }

  const address: string = body.address;
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
        body: JSON.stringify(params) 
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
        [Query.equal("address", address)]
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
              notification: `Lease ${lease.lease_id} status has changed to ${lease.state}.`,
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
                  `Lease ${lease.lease_id} status has changed to ${lease.state}.`
                ),
                Query.equal("type", lease.state),
              ]
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

  return new Response(
    JSON.stringify({
      data: docsAdded,
      success: true,
    }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );
}