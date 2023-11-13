import airplane
import requests
import os

# Constants for MongoDB resources
MONGODB_RESOURCE = 'akshay_mongodb'
OPEN_LEASE_COLLECTION_NAME = 'open_leases'
NOTIFICATIONS_COLLECTION_NAME = 'notifications'

# Environment variable for Akash DB API endpoint
api_url = os.getenv('AKASH_API_URL')

if not api_url:
    raise EnvironmentError('The environment variable COSMOS_API_URL is not set.')



def get_lease_shut_down_events(current_open_leases):
    # Initialize an empty list to store shutdown events
    events = []

    # Fetch the previously open leases from MongoDB
    prev_open_leases = airplane.mongodb.find(MONGODB_RESOURCE, OPEN_LEASE_COLLECTION_NAME)

    # Clear the previous open leases from the MongoDB collection
    airplane.mongodb.delete_many(MONGODB_RESOURCE, OPEN_LEASE_COLLECTION_NAME, filter={})

    # Compare the current open leases with the previous ones to determine if any have been closed
    for item in prev_open_leases.output:
        if item not in current_open_leases:
            # If a lease has been shut down, mark its state as "closed" and record the event
            item['state'] = "closed"
            events.append({
                            "read" : False,
                            "address" : item['lease_id'].split('/')[0],
                            "lease" : item['lease_id'].split('/')[1],
                            "notification": f"Lease shut down for {item['lease_id']}. Relaunch as soon as possible to limit downtime.",
                        })

    # Insert the current open leases into MongoDB for future reference
    airplane.mongodb.insert_many(MONGODB_RESOURCE, OPEN_LEASE_COLLECTION_NAME, current_open_leases)

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
            print(f"API call to cosmos failed with status code: {response.status_code}")
            break

    # Get the lease shutdown events and add them to the notification list
    events_to_notify += get_lease_shut_down_events(current_open_leases)
    
    return events_to_notify


# Define Airplane Tasks
@airplane.task(
    slug="akash_notification_logger",
    name="Akash Notification Logger",
    description="Scrapes and logs script that takes Akash Network events we are looking for and adds them as unread notifications to the MongoDB DB to use in the MetaMask Snap UI later.",
    resources = [
        airplane.Resource(
            slug=MONGODB_RESOURCE,
        )
    ],
    schedules = [
        airplane.Schedule(
            slug="akash_notification_logger_cron_job",
            cron="*/15 * * * *",
            description="checks for notifications every 15 minutes",
        )
    ]
)
def akash_notification_logger():
    
    # Fetch Events to notfiy
    events = get_events()
    
    # Insert the events into the MongoDB notifications collection
    airplane.mongodb.insert_many(MONGODB_RESOURCE, NOTIFICATIONS_COLLECTION_NAME, events)

    return "notifications uploaded to database successfully!"

