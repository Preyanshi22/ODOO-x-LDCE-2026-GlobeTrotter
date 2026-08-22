import os
from motor.motor_asyncio import AsyncIOMotorClient

# Corrected username: adhikarinitya09_db_user
MONGO_URI = "mongodb+srv://adhikarinitya09_db_user:HackathonPass2026@cluster0.wvaekeq.mongodb.net/globetrotter?retryWrites=true&w=majority&authSource=admin"

client = AsyncIOMotorClient(MONGO_URI)
db = client["globetrotter"]

trips_collection = db["trips"]
catalog_collection = db["city_catalog"]
