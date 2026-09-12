import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise RuntimeError("MONGO_URI is missing in backend/.env")

client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
db = client["niyamnetra"]
users_collection = db["users"]
users_collection.create_index("email", unique=True)
inspections_collection = db["inspections"]
