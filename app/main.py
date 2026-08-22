import os
import hashlib
import secrets
from pathlib import Path
from typing import Optional, List, Any
from fastapi import FastAPI, HTTPException, Body, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder
from bson import ObjectId
from pydantic import BaseModel
from app.database import trips_collection, catalog_collection, users_collection
from app.models import TripCreate

app = FastAPI(title="GlobeTrotter API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def hash_password(password: str) -> str:
    salt = "globetrotter_salt_2026"
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed

def format_trip(trip):
    if not trip:
        return None
    trip["id"] = str(trip["_id"])
    del trip["_id"]
    return trip

class UserRegister(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class AIGenerateRequest(BaseModel):
    destination: str
    days: int
    budget: float
    travel_style: str

@app.get("/")
def root():
    return {"message": "GlobeTrotter API is online", "docs": "/docs"}

@app.get("/health")
def health():
    return {"status": "ok"}

# --- Authentication Endpoints ---

@app.post("/api/auth/register", status_code=status.HTTP_201_CREATED)
async def register(user: UserRegister):
    clean_email = user.email.strip().lower()
    existing = await users_collection.find_one({"email": clean_email})
    if existing:
        raise HTTPException(status_code=400, detail="This email is already registered. Please sign in.")
    
    hashed_pwd = hash_password(user.password)
    user_doc = {
        "name": user.name.strip(),
        "email": clean_email,
        "password": hashed_pwd
    }
    result = await users_collection.insert_one(user_doc)
    return {
        "id": str(result.inserted_id),
        "name": user.name,
        "email": clean_email,
        "message": "User registered successfully"
    }

@app.post("/api/auth/login")
async def login(credentials: UserLogin):
    clean_email = credentials.email.strip().lower()
    user = await users_collection.find_one({"email": clean_email})
    if not user or not verify_password(credentials.password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    return {
        "id": str(user["_id"]),
        "name": user.get("name", "User"),
        "email": user.get("email"),
        "token": f"token-{str(user['_id'])}"
    }

# --- AI & Catalog Endpoints ---

@app.post("/api/ai/generate-itinerary")
async def generate_ai_itinerary(req: AIGenerateRequest):
    return {
        "title": f"{req.days}-Day {req.travel_style.title()} Adventure in {req.destination}",
        "destination": req.destination,
        "days": req.days,
        "estimated_budget": req.budget,
        "highlights": [
            f"Explore historic landmarks in {req.destination}",
            f"Savor authentic local food",
            f"Guided walking tours and hidden gems"
        ],
        "generated_activities": [
            {"day": i + 1, "activity": f"Curated {req.travel_style} Tour - Phase {i + 1}", "cost": round(req.budget / req.days, 2)}
            for i in range(req.days)
        ]
    }

@app.get("/api/catalog/destinations")
async def get_destination_catalog():
    destinations = []
    cursor = catalog_collection.find()
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        destinations.append(doc)
    
    if not destinations:
        return [
            {
                "id": "dest-1",
                "name": "Kyoto, Japan",
                "category": "Culture & Heritage",
                "country": "Japan",
                "image": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
                "rating": 4.9,
                "review_count": 1240,
                "price_level": "moderate",
                "description": "Ancient temples, traditional teahouses, and serene bamboo forests."
            }
        ]
    return destinations

# --- Trip CRUD Endpoints ---

@app.get("/api/trips")
async def get_trips():
    trips = []
    cursor = trips_collection.find()
    async for doc in cursor:
        trips.append(format_trip(doc))
    return trips

@app.post("/api/trips")
async def create_trip(trip: TripCreate):
    try:
        data = jsonable_encoder(trip)
        result = await trips_collection.insert_one(data)
        data["id"] = str(result.inserted_id)
        if "_id" in data:
            del data["_id"]
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/trips/{trip_id}")
async def get_trip(trip_id: str):
    try:
        doc = await trips_collection.find_one({"_id": ObjectId(trip_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Trip ID format")
    if not doc:
        raise HTTPException(status_code=404, detail="Trip not found")
    return format_trip(doc)

@app.put("/api/trips/{trip_id}")
async def update_trip(trip_id: str, updates: dict = Body(...)):
    try:
        oid = ObjectId(trip_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Trip ID format")
    
    if "_id" in updates:
        del updates["_id"]
    if "id" in updates:
        del updates["id"]

    result = await trips_collection.update_one({"_id": oid}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    updated_doc = await trips_collection.find_one({"_id": oid})
    return format_trip(updated_doc)

@app.delete("/api/trips/{trip_id}")
async def delete_trip(trip_id: str):
    try:
        oid = ObjectId(trip_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Trip ID format")
    
    result = await trips_collection.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Trip not found")
    return {"message": "Trip deleted successfully", "id": trip_id}

@app.get("/api/trips/{trip_id}/budget")
async def get_trip_budget(trip_id: str):
    try:
        doc = await trips_collection.find_one({"_id": ObjectId(trip_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Trip ID format")
        
    if not doc:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    categories = {"transport": 0.0, "stay": 0.0, "activities": 0.0, "meals": 0.0}
    for act in doc.get("activities", []):
        cat = act.get("category", "activities").lower()
        cost = float(act.get("cost", 0.0))
        if cat in categories:
            categories[cat] += cost
        else:
            categories["activities"] += cost

    total_spent = sum(categories.values())
    total_budget = float(doc.get("total_budget", 0.0))

    return {
        "categories": categories,
        "total_spent": total_spent,
        "total_budget": total_budget,
        "remaining": max(0.0, total_budget - total_spent),
        "is_overbudget": total_spent > total_budget
    }
