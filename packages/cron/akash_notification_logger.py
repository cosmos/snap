import requests
import os
from appwrite.client import Client
from appwrite.services import databases
from appwrite.services import functions

client = Client()
db = databases.Databases(client)
funcs = functions.Functions(client)

if os.environ.get("APPWRITE_ENDPOINT") is None:
    raise EnvironmentError('The environment variable APPWRITE_ENDPOINT is not set.')
client.set_endpoint('https://cloud.appwrite.io/v1').set_project('659832bdd99000571f19').set_key(os.environ.get("APPWRITE_KEY")).set_self_signed()

# Constants for MongoDB resources
MONGODB_RESOURCE = 'akash_mongodb'
OPEN_LEASE_COLLECTION_NAME = 'open_leases'
NOTIFICATIONS_COLLECTION_NAME = 'notifications'

# Environment variable for Akash DB API endpoint
api_url = os.getenv('AKASH_API_URL')

if not api_url:
    raise EnvironmentError('The environment variable AKASH_API_URL is not set.')

def get_lease_shut_down_events(current_open_leases):
    # Initialize an empty list to store shutdown events
    events = []

    # Fetch the previously open leases from MongoDB
    db_data = airplane.mongodb.find(MONGODB_RESOURCE, OPEN_LEASE_COLLECTION_NAME, filter={"state": "open"})
    old_leases = db_data.output

    closed_leases = [] # stores leases that were logged before and are now closed
    prev_open_leases = [] # stores leases that were logged before and are still open


    # Compare the current open leases with the previous ones to determine if any have been closed
    for lease in old_leases:
        if lease not in current_open_leases:
            # If a lease has been shut down, mark its state as "closed" and record the event
            closed_leases.append(lease['lease_id'])
            events.append({
                            "read" : False,
                            "address" : lease['lease_id'].split('/')[0],
                            "lease" : lease['lease_id'].split('/')[1],
                            "notification": f"Lease shut down for {lease['lease_id']}. Relaunch as soon as possible to limit downtime.",
                        })
        else:
            # record previously logged leases
            prev_open_leases.append(lease)
    

    # Update the leases that are closed now
    airplane.mongodb.update_many(MONGODB_RESOURCE, OPEN_LEASE_COLLECTION_NAME,
                                 update={'$set': {'state': 'closed'}},
                                 filter={'lease_id': {'$in': closed_leases}}
                                )
    # Get New Leases
    new_leases = [lease for lease in current_open_leases if lease not in prev_open_leases]
    
    # Insert New leases
    airplane.mongodb.insert_many(MONGODB_RESOURCE, OPEN_LEASE_COLLECTION_NAME, new_leases)

    return events

def get_lease_low_balance_events(deployments):
    # Initialize lists to store low balance events and current open leases
    events = []
    current_open_leases = []

    # Process each deployment item
    for item in deployments:
        # Record all the current open leases
        current_open_leases.append({
                                    "lease_id": item['escrow_account']['id']['xid'],
                                    "state": item['deployment']['state']
                                    })
        # check for low balance
        if float(item['escrow_account']['balance']['amount']) < 1:
            events.append({
                            "read" : False,
                            "address" : item['escrow_account']['owner'],
                            "lease" : item['deployment']['deployment_id']['dseq'],
                            "notification": f"Lease balance is below $1 for lease {item['escrow_account']['id']['xid']}. Refill as soon as possible.",
                        })
                       

    return events, current_open_leases


def get_events():

    try:
        # Initialize lists to store notifications
        events_to_notify = []
        current_open_leases = []

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
                current_open_leases += open_leases

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

def akash_notification_logger():

    # Fetch Events to notify
    events = get_events()

    # Insert the events into the MongoDB notifications collection
    airplane.mongodb.insert_many(MONGODB_RESOURCE, NOTIFICATIONS_COLLECTION_NAME, events)

    return "notifications uploaded to database successfully!"
