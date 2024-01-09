import requests
import os
from appwrite.client import Client
from appwrite.services import databases
from appwrite.services import functions
from appwrite.query import Query
from type import DB_LEASE_RETURN, AKASH_NOTIFICATION, AKASH_LEASE

client = Client()
db = databases.Databases(client)
funcs = functions.Functions(client)

if os.environ.get("APPWRITE_ENDPOINT") is None:
    raise EnvironmentError('The environment variable APPWRITE_ENDPOINT is not set.')

client.set_endpoint('https://cloud.appwrite.io/v1').set_project('659832bdd99000571f19').set_key(os.environ.get("APPWRITE_KEY")).set_self_signed()

# Constants for MongoDB resources
RESOURCE = 'akash_mongodb'
OPEN_LEASE_COLLECTION_NAME = 'open_leases'
NOTIFICATIONS_COLLECTION_NAME = 'notifications'

# Environment variable for Akash DB API endpoint
api_url = os.getenv('AKASH_API_URL')

if not api_url:
    raise EnvironmentError('The environment variable AKASH_API_URL is not set.')

def get_lease_shut_down_events(current_open_leases):
    # Initialize an empty list to store shutdown events
    events: list[AKASH_NOTIFICATION] = []

    # Fetch the previously open leases from database
    data: DB_LEASE_RETURN = db.list_documents(RESOURCE, OPEN_LEASE_COLLECTION_NAME, Query.equal('state', 'open')) # type: ignore
    
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
            }
            events.append(add)
        else:
            # record previously logged leases
            prev_open_leases.append(lease['lease_id'])
    

    # Update the leases that are closed now
    for lease in closed_leases:
        db.update_document(RESOURCE, OPEN_LEASE_COLLECTION_NAME, lease, {
             'state' : 'closed',
             'lease_id' : lease,
        })

    # Get New Leases
    new_leases: list[AKASH_LEASE] = [lease for lease in list(current_open_leases.keys()) if lease not in prev_open_leases]
    
    # Insert New leases
    for lease in new_leases:
        db.create_document(RESOURCE, OPEN_LEASE_COLLECTION_NAME, lease, {
             'state' : 'open',
             'lease_id' : lease,
        })

    return events

def get_lease_low_balance_events(deployments):
    # Initialize lists to store low balance events and current open leases
    events: list[AKASH_NOTIFICATION] = []
    current_open_leases: dict[str, AKASH_LEASE] = dict()

    # Process each deployment item
    for item in deployments:
        # Record all the current open leases
        add: AKASH_LEASE = {
        "lease_id": item['escrow_account']['id']['xid'],
        "state": item['deployment']['state']
        }
        current_open_leases[item['escrow_account']['id']['xid']] = add
        # check for low balance
        if float(item['escrow_account']['balance']['amount']) < 1:
            notif_add: AKASH_NOTIFICATION = {
                "read" : False,
                "address" : item['escrow_account']['owner'],
                "lease" : item['deployment']['deployment_id']['dseq'],
                "notification": f"Lease balance is below $1 for lease {item['escrow_account']['id']['xid']}. Refill as soon as possible.",
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
        print(f"An Error occurred : {str(e)}")
        raise e

def akash_notification_logger():

    # Fetch Events to notify
    events = get_events()

    # Insert the events into the MongoDB notifications collection
    for event in events:
        db.create_document(RESOURCE, NOTIFICATIONS_COLLECTION_NAME, event['lease'], event)

    return "notifications uploaded to database successfully!"
