from concurrent.futures import ThreadPoolExecutor
import requests
import os
import asyncio
from appwrite.client import Client
from appwrite.services import databases
from appwrite.query import Query
from typing import TypedDict, Union
from enum import Enum
from datetime import datetime

def get_current_utc_timestamp():
    return datetime.utcnow().timestamp()

def get_no_of_days(timestamp1, timestamp2):
    t1 = datetime.fromtimestamp(timestamp1 / 1000)
    t2 = datetime.fromtimestamp(timestamp2 / 1000)

    return (t2 - t1).days

class Status(Enum):
    OPEN = 'open'
    CLOSED = 'closed'

class AKASH_LEASE(TypedDict):
    lease_id: str
    state: str

class AKASH_NOTIFICATION(TypedDict):
    read: bool
    address: str
    lease: str
    notification: str
    timestamp: float

class DB_NOTIFICATION_RETURN(TypedDict):
    total: int
    documents: list[AKASH_NOTIFICATION]

class DB_LEASE_RETURN(TypedDict):
    total: int
    documents: list[AKASH_LEASE]

client = Client()
db = databases.Databases(client)
# hold all asyncio tasks
tasks = []

if os.environ.get("APPWRITE_KEY") is None:
    raise EnvironmentError('The environment variable APPWRITE_KEY is not set.')

client.set_endpoint('https://cloud.appwrite.io/v1').set_project('659832bdd99000571f19').set_key(os.environ.get("APPWRITE_KEY")).set_self_signed()

# Constants for resources
RESOURCE = 'akash'
OPEN_LEASE_COLLECTION_NAME = 'open_leases'
NOTIFICATIONS_COLLECTION_NAME = 'notifications'

# Environment variable for Akash DB API endpoint
api_url = os.getenv('AKASH_API_URL')
if not api_url:
    raise EnvironmentError('The environment variable AKASH_API_URL is not set.')

akash_balance_threshold = os.getenv('AKASH_BALANCE_THRESHOLD')
if not akash_balance_threshold:
    raise EnvironmentError('The environment variable AKASH_BALANCE_THRESHOLD is not set.')

# Async wrapper around add document
async def add_document_async(collection_name: str, doc_id: str, doc: Union[AKASH_LEASE, AKASH_NOTIFICATION]):
    print(f"Adding {doc_id} into {collection_name}.")
    loop = asyncio.get_event_loop()
    with ThreadPoolExecutor() as pool:
        result = await loop.run_in_executor(pool, lambda: db.create_document(RESOURCE, collection_name, doc_id, doc))

    return result

# Async wrapper around update document
async def update_document_async(collection_name: str, doc_id: str, doc: Union[AKASH_LEASE, AKASH_NOTIFICATION]):
    print(f"Updating {doc_id} in {collection_name}.")
    loop = asyncio.get_event_loop()
    with ThreadPoolExecutor() as pool:
        result = await loop.run_in_executor(pool, lambda: db.update_document(RESOURCE, collection_name, doc_id, doc))
        
    return result

def get_lease_shut_down_events(current_open_leases):
    # Initialize an empty list to store shutdown events
    events: list[AKASH_NOTIFICATION] = []

    # Fetch the previously open leases from database
    data: DB_LEASE_RETURN = db.list_documents(RESOURCE, OPEN_LEASE_COLLECTION_NAME, [Query.equal('state', 'open')]) # type: ignore
    
    if data is not None and 'total' in data and 'documents' in data:
        old_leases: list[AKASH_LEASE] = data['documents']
    else:
        old_leases: list[AKASH_LEASE] = []
    
    closed_leases: list[str] = [] # stores leases that were logged before and are now closed
    prev_open_leases: list[str] = [] # stores leases that were logged before and are still open


    # Compare the current open leases with the previous ones to determine if any have been closed
    for lease in old_leases:
        if current_open_leases.get(lease['lease_id']) is None:
            # If a lease has been shut down, mark its state as "closed" and record the event
            closed_leases.append(lease['lease_id'])
            add: AKASH_NOTIFICATION = {
                "read" : False,
                "address" : lease['lease_id'].split('/')[0],
                "lease" : lease['lease_id'].split('/')[1],
                "notification": f"Lease shut down for {lease['lease_id']}. Relaunch as soon as possible to limit downtime.",
                "timestamp": get_current_utc_timestamp(),
            }
            events.append(add)
        else:
            # record previously logged leases
            prev_open_leases.append(lease['lease_id'])
    

    # Update the leases that are closed now
    for lease in closed_leases:
        doc: AKASH_LEASE = {
            'state' : Status.CLOSED.value,
            'lease_id' : lease,
        }
        event = update_document_async(OPEN_LEASE_COLLECTION_NAME, lease, doc)
        tasks.append(event)

    # Get New Leases
    new_leases: list[str] = [lease for lease in list(current_open_leases.keys()) if lease not in prev_open_leases]
    
    # Insert New leases
    for lease in new_leases:
        doc: AKASH_LEASE = {
            'state' : Status.OPEN.value,
            'lease_id' : lease,
        }
        event = add_document_async(OPEN_LEASE_COLLECTION_NAME, lease, doc)
        tasks.append(event)

    return events

def get_lease_low_balance_events(deployments):
    # Initialize lists to store low balance events and current open leases
    events: list[AKASH_NOTIFICATION] = []
    current_open_leases: dict[str, AKASH_LEASE] = dict()

    # Process each deployment item
    for item in deployments:
        # Record all the current open leases
        add: AKASH_LEASE = {
        "lease_id": item['deployment']['deployment_id']['dseq'],
        "state": item['deployment']['state']
        }
        current_open_leases[item['deployment']['deployment_id']['dseq']] = add
        # check for low balance
        if (float(item['escrow_account']['balance']['amount'])/1000000) < float(akash_balance_threshold):
            notif_add: AKASH_NOTIFICATION = {
                "read" : False,
                "address" : item['escrow_account']['owner'],
                "lease" : item['deployment']['deployment_id']['dseq'],
                "notification": f"Lease balance is below $1 for lease {item['deployment']['deployment_id']['dseq']}. Refill as soon as possible.",
                "timestamp": get_current_utc_timestamp()
            }
            events.append(notif_add)            

    return events, current_open_leases


def get_events() -> list[AKASH_NOTIFICATION]:

    try:
        # Initialize lists to store notifications
        events_to_notify: list[AKASH_NOTIFICATION] = []
        current_open_leases: dict[str, AKASH_LEASE] = dict()

        # Pagination variables for the API request
        current_offset = 0
        page_limit = 1000

        # fetch all open akash leases
        while True:

            # Set parameters for the only open leases
            params = {
                "filters.state": "active",
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

                '''
                Retrieve and log low balance leases, maintain a record of
                current open leases from current page of deploymenst
                '''
                events, open_leases = get_lease_low_balance_events(data['deployments'])

                # Accumulate events and open leases
                events_to_notify += events
                current_open_leases.update(open_leases)

                #update pagination info
                pagination_total = data['pagination']['total']
                current_offset += page_limit

                # Break the loop if we have reached the last page
                if current_offset >= int(pagination_total):
                    break
            
            else:
                raise Exception(f"API call to cosmos failed with status code: {response.status_code}")

        # Get the lease shutdown events and add them to the notification list
        events_to_notify += get_lease_shut_down_events(current_open_leases)
        
        return events_to_notify
    
    except Exception as e:
        raise e

def main():

    try:
        # Fetch Events to notify
        events = get_events()

        data: DB_NOTIFICATION_RETURN = db.list_documents(RESOURCE, NOTIFICATIONS_COLLECTION_NAME) # type: ignore
        past_notifications = data['documents']

        past_notifications_dict: dict[str, AKASH_NOTIFICATION] = dict()

        for notifications in past_notifications:
            past_notifications_dict[notifications['lease']] = notifications

        # Insert the events into the database notifications collection
        for event in events:
            if (past_notifications_dict.get(event['lease']) != None and 
                get_no_of_days(past_notifications_dict[event['lease']]['timestamp'], get_current_utc_timestamp()) < 1):
                continue
            task = add_document_async(NOTIFICATIONS_COLLECTION_NAME, event['lease'], event)
            tasks.append(task)
        
        loop = asyncio.get_event_loop()
        loop.run_until_complete(asyncio.gather(*tasks))
        loop.close()

    except Exception as e:
        raise e
    
main()