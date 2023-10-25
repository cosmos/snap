import os

from pymongo import MongoClient


def get_database():
 
   CONNECTION_STRING = os.environ.get("SNAP_DB")
 
   client = MongoClient(CONNECTION_STRING)

   return client["akash_notifications_db"]