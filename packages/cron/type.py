from typing import TypedDict
from enum import Enum

class Status(Enum):
    OPEN = 'open'
    CLOSED = 'closed'

class AKASH_LEASE(TypedDict):
    lease_id: str
    state: Status

class AKASH_NOTIFICATION(TypedDict):
    read: bool
    address: str
    lease: str
    notification: str

class DB_NOTIFICATION_RETURN(TypedDict):
    total: int
    documents: list[AKASH_NOTIFICATION]

class DB_LEASE_RETURN(TypedDict):
    total: int
    documents: list[AKASH_LEASE]