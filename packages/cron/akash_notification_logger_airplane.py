import airplane
import json


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
)
def akash_notification_logger(resources=[
    # Attach the resource with slug "backend_db" under the alias "db"
        airplane.Resource(
            slug="akshay_mongodb",
        )
    ],
    schedules=[
        airplane.Schedule(
            slug="akash_notification_logger",
            cron="*/15 * * * *",
            description="checks for notification every 15 minutes",
        )
    ]):
    data = [
        {"id": 1, "name": "Gabriel Davis", "role": "Dentist"},
        {"id": 2, "name": "Carolyn Garcia", "role": "Sales"},
        {"id": 3, "name": "Frances Hernandez", "role": "Astronaut"},
        {"id": 4, "name": "Melissa Rodriguez", "role": "Engineer"},
        {"id": 5, "name": "Jacob Hall", "role": "Engineer"},
        {"id": 6, "name": "Andrea Lopez", "role": "Astronaut"},
    ]

    # Sort the data in ascending order by name.
    data = sorted(data, key=lambda u: u["name"])

    # You can return data to show output to users.
    # Output documentation: https://docs.airplane.dev/tasks/output
    return data
