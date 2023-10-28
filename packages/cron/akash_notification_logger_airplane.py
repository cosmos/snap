import airplane
import requests

MONGODB_RESOURCE = 'akshay_mongodb'
OPEN_LEASE_COLLECTION_NAME = 'open_leases'
NOTIFICATIONS_COLLECTION_NAME = 'notifications'

api_url = "https://rest.cosmos.directory/akash/akash/deployment/v1beta3/deployments/list"


def get_lease_shut_down_events(current_open_leases):
    events = []

    prev_open_leases = airplane.mongodb.find(MONGODB_RESOURCE, OPEN_LEASE_COLLECTION_NAME)
    airplane.mongodb.delete_many(MONGODB_RESOURCE, OPEN_LEASE_COLLECTION_NAME, filter={})


    for item in prev_open_leases.output:
        if item not in current_open_leases:
            item['state'] = "closed"
            events.append({
                            "read" : False,
                            "address" : item['lease_id'].split('/')[0],
                            "lease" : item['lease_id'].split('/')[1],
                            "notification": f"Lease shut down for {item['lease_id']}. Relaunch as soon as possible to limit downtime.",
                        })

    airplane.mongodb.insert_many(MONGODB_RESOURCE, OPEN_LEASE_COLLECTION_NAME, current_open_leases)

    return events

def get_lease_low_balance_events(deployments):
    events = []
    current_open_leases = []

    for item in deployments:
        current_open_leases.append({
                                    "lease_id": item['escrow_account']['id']['xid'],
                                    "state": item['deployment']['state']
                                    })
        if float(item['escrow_account']['balance']['amount']) < 1:
            events.append({
                            "read" : False,
                            "address" : item['escrow_account']['owner'],
                            "lease" : item['deployment']['deployment_id']['dseq'],
                            "notification": f"Lease balance is below $1 for lease {item['escrow_account']['id']['xid']}. Refill as soon as possible.",
                        })
                        

    return events, current_open_leases


def get_events():
    events_to_notify = []
    current_open_leases = []

    current_offset = 0
    page_limit = 1000

    while True:

        params = {
            "filters.state": "active",
            "pagination.limit": page_limit,
            "pagination.count_total": True,
            "pagination.offset": current_offset
        }  

        response = requests.get(api_url, params=params)

        if response.status_code == 200:

            data = response.json()

            events, open_leases = get_lease_low_balance_events(data['deployments'])

            events_to_notify += events
            current_open_leases += open_leases

            pagination_total = data['pagination']['total']
            current_offset += page_limit

            if current_offset >= int(pagination_total):
                break
        
        else:
            print(f"API call to cosmos failed with status code: {response.status_code}")
            break

    
    events_to_notify += get_lease_shut_down_events(current_open_leases)
    
    return events_to_notify



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
    
    events = get_events()
    
    airplane.mongodb.insert_many(MONGODB_RESOURCE, NOTIFICATIONS_COLLECTION_NAME, events)

    return "notifications uploaded to database successfully!"

