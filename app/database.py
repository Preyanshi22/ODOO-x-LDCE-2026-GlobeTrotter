import os
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "globetrotter")

client = AsyncIOMotorClient(
    MONGO_URI,
    tlsCAFile=certifi.where(),
    tls=True,
    tlsAllowInvalidCertificates=True
)
database = client[DB_NAME]

trips_collection = database.get_collection("trips")
catalog_collection = database.get_collection("catalog")
users_collection = database.get_collection("users")
