import airplane
import json

from database import get_database
from typing import Optional

get_database()

def get_lease_low_balance_event(address: str, lease_id: str, lease_name: str):
    return json.dumps({
        "read" : False,
        "address" : address,
        "lease" : lease_id,
        "notification": f"Lease balance is below $1 for lease {lease_name}. Refill as soon as possible.",
    })

def get_lease_shut_down_event(address: str, lease_id: str, lease_name: str):
    return json.dumps({
        "read" : False,
        "address" : address,
        "lease" : lease_id,
        "notification": f"Lease shut down for {lease_name}. Relaunch as soon as possible to limit downtime.",
    })


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
            slug="akash_notification_logger",
            cron="*/15 * * * *",
            description="checks for notification every 15 minutes",
        )
    ]
)
def akash_notification_logger(address: str,
    lease_id: str,
    lease_name: str,
    is_low_balance_event: bool,
    is_shut_down_event: bool):
    
    events = []

    if is_low_balance_event:
        events.append(get_lease_low_balance_event(address, lease_id, lease_name))
    
    if is_shut_down_event:
        events.append(get_lease_shut_down_event(address, lease_id, lease_name))

    

    airplane.mongodb.insert_many("akshay_mongodb", "akash_notifications", events)


    return events
