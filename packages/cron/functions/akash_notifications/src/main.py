from datetime import datetime
from enum import Enum
import json
from typing import TypedDict
from appwrite.query import Query
from appwrite.client import Client
from appwrite.services import databases
import os
import requests
import uuid

def main(context):

    class Status(Enum):
        ACTIVE = 'active'
        OPEN = 'open'
        CLOSED = 'closed'
        PAUSED = 'paused'
        OVERDRAWN = 'overdrawn'
        INSUFFIENCT = 'insufficient_funds'
        INVALID = 'invalid'

    class AKASH_LEASE(TypedDict):
        lease_id: str
        state: Status
        address: str

    class AKASH_NOTIFICATION(TypedDict):
        read: bool
        address: str
        lease: str
        notification: str
        timestamp: float
        type: Status

    class DB_NOTIFICATION_RETURN(TypedDict):
        total: int
        documents: list[AKASH_NOTIFICATION]

    class DB_LEASE_RETURN(TypedDict):
        total: int
        documents: list[AKASH_LEASE]

    # Constants for resources
    RESOURCE = 'akash'
    OPEN_LEASE_COLLECTION_NAME = 'open_leases'
    NOTIFICATIONS_COLLECTION_NAME = 'notifications'

    api_url = os.getenv('AKASH_API_URL')
    if not api_url:
        raise EnvironmentError('The environment variable AKASH_API_URL is not set.')

    if os.environ.get("APPWRITE_KEY") is None:
        raise EnvironmentError('The environment variable APPWRITE_KEY is not set.')
    
    client = Client()
    db = databases.Databases(client)
    client.set_endpoint('https://cloud.appwrite.io/v1').set_project('659832bdd99000571f19').set_key(os.environ.get("APPWRITE_KEY")).set_self_signed()

    if context.req.method != "POST":
        context.error(f"Invalid HTTP method {context.req.method}")
        raise Exception("Invalid HTTP method")
    
    body = json.loads(context.req.body)
    context.log(f"Request body: {body}")
    
    if "address" not in body:
        context.error(f"Missing address in request body")
        raise Exception("Missing address in request body")
    
    address: str = body['address']
    context.log(f"Updating Akash leases for {address}")

    client = (
        Client()
            .set_endpoint("https://cloud.appwrite.io/v1")
            .set_project("659832bdd99000571f19")
            .set_key(os.environ.get("APPWRITE_KEY"))
    )

    # Keep track of docs added
    docs_added = []

    # Pagination variables for the API request
    current_offset = 0
    page_limit = 1000

    # fetch all open akash leases
    leases: list[AKASH_LEASE] = []
    while True:

        # Set parameters for the only open leases
        params = {
            "filters.owner": address,
            "pagination.limit": page_limit,
            "pagination.count_total": True,
            "pagination.offset": current_offset
        }

        # get current set of open leases
        response = requests.get(api_url, params=params)

        # check if API call was successful
        if response.status_code == 200:

            # Parse the response data
            data = response.json()
            deployments = data['deployments']

            leases = [{ "lease_id": deployment["deployment"]["deployment_id"]["dseq"], "state": deployment["deployment"]["state"], "address": deployment["deployment"]["deployment_id"]["owner"] } for deployment in deployments]

            lease_return: DB_LEASE_RETURN = db.list_documents(RESOURCE, OPEN_LEASE_COLLECTION_NAME) # type: ignore
            current_leases = lease_return["documents"]

            # Check which leases have there status changed and add notifications to it if changed
            for lease in leases:
                if lease["lease_id"] in [c_lease["lease_id"] for c_lease in current_leases]:
                    found_lease: list[AKASH_LEASE] = list(filter(lambda d: d['lease_id'] == lease["lease_id"], current_leases))
                    # If we have not found any lease with the same id, continue through loop but log it
                    if len(found_lease) != 0:
                        context.log(f"Lease {lease['lease_id']} not found in current leases. Continuing.")
                        continue
                    if found_lease[0]['state'] != lease['state']:
                        notif_add: AKASH_NOTIFICATION = {
                            "read" : False,
                            "address" : lease["address"],
                            "lease" : lease["lease_id"],
                            "notification": f"Lease {lease['lease_id']} status has changed to {lease['state']}.",
                            "timestamp": datetime.utcnow().timestamp(),
                            "type": lease['state']
                        }
                        # Check if we have sent this notification already, (do not compare timestamp or read)
                        notif_return: DB_NOTIFICATION_RETURN = db.list_documents(RESOURCE, NOTIFICATIONS_COLLECTION_NAME, [Query.equal("address", lease["address"]), Query.equal("lease_id", lease["lease_id"]), Query.equal("notification", f"Lease {lease['lease_id']} status has changed to {lease['state']}."), Query.equal("type", lease['state'])]) # type: ignore
                        # Add the notification if it does not exist # type: ignore
                        if len(notif_return["documents"]) == 0:
                            context.log(f"Adding notification for lease {lease['lease_id']}.")
                            res = db.create_document(RESOURCE, NOTIFICATIONS_COLLECTION_NAME, uuid.uuid4(), notif_add)
                            docs_added.append(res)
                        else:
                            context.log(f"Notification for lease {lease['lease_id']} already exists.")
                    # Since we already have the lease in the database, we can update it
                    db.update_document(RESOURCE, OPEN_LEASE_COLLECTION_NAME, lease["lease_id"], lease)
                else:
                    context.log(f"Adding lease {lease} to the database.")
                    # If we have not found the lease, we add it to the database
                    db.create_document(RESOURCE, OPEN_LEASE_COLLECTION_NAME, lease["lease_id"], lease)

            #update pagination info
            pagination_total = data['pagination']['total']
            current_offset += page_limit

            # Break the loop if we have reached the last page
            if current_offset >= int(pagination_total):
                break
        
        else:
            raise Exception(f"API call to cosmos failed with status code: {response.status_code}")

    return context.res.json({
        "data": docs_added,
        "success": True,
    })