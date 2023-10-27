import airplane
import json
import requests

api_url = "https://rest.cosmos.directory/akash/akash/deployment/v1beta3/deployments/list"


def get_lease_low_balance_event(address, lease_id, lease_name):
    return json.dumps({
        "read" : False,
        "address" : address,
        "lease" : lease_id,
        "notification": f"Lease balance is below $1 for lease {lease_name}. Refill as soon as possible.",
    })

def get_lease_shut_down_event(address, lease_id, lease_name):
    return json.dumps({
        "read" : False,
        "address" : address,
        "lease" : lease_id,
        "notification": f"Lease shut down for {lease_name}. Relaunch as soon as possible to limit downtime.",
    })

def get_events_to_notify(deployments):
    events = []

    for item in deployments:
        if item['escrow_account']['balance']['amount'] < 1:
            events.append(get_lease_low_balance_event())
    """
    TODO 
    Implement shutdown logic
    
    """
        
    return events


def get_events():
    events_to_notify = []

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

            events_to_notify += get_leases_to_notify(data['deployments'])

            pagination_total = data['pagination']['total']
            current_offset += page_limit

            if current_offset >= pagination_total:
                break
        
        else:
            print(f"API call to cosmos failed with status code: {response.status_code}")
            break
    
    return events_to_notify



@airplane.task(
    slug="akash_notification_logger",
    name="Akash Notification Logger",
    description="Scrapes and logs script that takes Akash Network events we are looking for and adds them as unread notifications to the MongoDB DB to use in the MetaMask Snap UI later.",
    resources = [
        airplane.Resource(
            slug="akshay_mongodb",
        )
    ],
    schedules = [
        airplane.Schedule(
            slug="akash_notification_logger_cron",
            cron="*/15 * * * *",
            description="checks for notifications every 15 minutes",
        )
    ]
)
def akash_notification_logger():
    
    events = get_events()
    
    run = airplane.mongodb.insert_many('akshay_mongodb', 'snap_notifications', events)

    return run.output
