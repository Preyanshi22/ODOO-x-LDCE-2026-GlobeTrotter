import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

DEFAULT_MONGO_URI = "mongodb+srv://adhikarinitya09_db_user:HackathonPass2026@cluster0.wvaekeq.mongodb.net/globetrotter?retryWrites=true&w=majority&authSource=admin&tls=true&tlsAllowInvalidCertificates=true"
MONGO_URI = os.getenv("MONGO_URI", DEFAULT_MONGO_URI)

client = AsyncIOMotorClient(MONGO_URI, serverSelectionTimeoutMS=5000, tlsAllowInvalidCertificates=True)
db = client["globetrotter"]

trips_collection = db["trips"]
catalog_collection = db["city_catalog"]
users_collection = db["users"]
