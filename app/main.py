import os
import json
import httpx
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.encoders import jsonable_encoder
from bson import ObjectId
from app.database import trips_collection, catalog_collection
from app.models import TripCreate, TripUpdate, Activity, AIGenerateRequest

app = FastAPI(
    title="GlobeTrotter API",
    description="Backend service for luxury travel planning, budget management, and AI itinerary generation.",
    version="1.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def format_trip(trip):
    if not trip:
        return None
    trip["id"] = str(trip["_id"])
    del trip["_id"]
    return trip

# Health Check Endpoint
@app.get("/health")
def health():
    return {"status": "ok", "service": "GlobeTrotter API"}

# API Endpoints
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
async def update_trip(trip_id: str, trip_update: TripUpdate):
    try:
        obj_id = ObjectId(trip_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Trip ID format")
    
    update_data = {k: v for k, v in jsonable_encoder(trip_update).items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update")
    
    result = await trips_collection.update_one({"_id": obj_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    updated_doc = await trips_collection.find_one({"_id": obj_id})
    return format_trip(updated_doc)

@app.delete("/api/trips/{trip_id}")
async def delete_trip(trip_id: str):
    try:
        obj_id = ObjectId(trip_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Trip ID format")
    
    result = await trips_collection.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Trip not found")
    return {"status": "success", "message": f"Trip {trip_id} deleted successfully"}

@app.post("/api/trips/{trip_id}/activities")
async def add_activity(trip_id: str, activity: Activity):
    try:
        obj_id = ObjectId(trip_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Trip ID format")
    
    act_data = jsonable_encoder(activity)
    result = await trips_collection.update_one({"_id": obj_id}, {"$push": {"activities": act_data}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    updated_doc = await trips_collection.find_one({"_id": obj_id})
    return format_trip(updated_doc)

@app.delete("/api/trips/{trip_id}/activities/{activity_index}")
async def delete_activity(trip_id: str, activity_index: int):
    try:
        obj_id = ObjectId(trip_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Trip ID format")
    
    doc = await trips_collection.find_one({"_id": obj_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    activities = doc.get("activities", [])
    if activity_index < 0 or activity_index >= len(activities):
        raise HTTPException(status_code=400, detail="Activity index out of bounds")
    
    activities.pop(activity_index)
    await trips_collection.update_one({"_id": obj_id}, {"$set": {"activities": activities}})
    
    updated_doc = await trips_collection.find_one({"_id": obj_id})
    return format_trip(updated_doc)

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

@app.get("/api/trips/{trip_id}/public")
async def get_public_trip(trip_id: str):
    try:
        doc = await trips_collection.find_one({"_id": ObjectId(trip_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Trip ID format")
        
    if not doc:
        raise HTTPException(status_code=404, detail="Trip not found")
    return format_trip(doc)

@app.get("/api/catalog/destinations")
async def get_destination_catalog():
    cursor = catalog_collection.find()
    catalog = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        catalog.append(doc)
    
    if not catalog:
        # Fallback rich catalog if collection is empty
        catalog = [
            {
                "id": "cat_1",
                "name": "Kyoto, Japan",
                "tagline": "Ancient Temples & Zen Gardens",
                "image": "assets/images/Kyoto Temple Scene.png",
                "recommended_days": 5,
                "est_budget": 85000,
                "currency": "₹"
            },
            {
                "id": "cat_2",
                "name": "Paris & Swiss Alps",
                "tagline": "Romantic European Winter Escape",
                "image": "assets/images/Parisian Winter Romance.png",
                "recommended_days": 7,
                "est_budget": 120000,
                "currency": "₹"
            },
            {
                "id": "cat_3",
                "name": "Santorini & Amalfi",
                "tagline": "Mediterranean Sun & Coastal Views",
                "image": "assets/images/Santorini Caldera View.png",
                "recommended_days": 6,
                "est_budget": 95000,
                "currency": "₹"
            },
            {
                "id": "cat_4",
                "name": "Barcelona Architecture",
                "tagline": "Gaudí Masterpieces & Modernist Splendor",
                "image": "assets/images/Barcelona Architectural Detail.png",
                "recommended_days": 4,
                "est_budget": 75000,
                "currency": "₹"
            }
        ]
    return catalog

@app.post("/api/ai/generate-itinerary")
async def generate_ai_itinerary(req: AIGenerateRequest):
    groq_api_key = os.getenv("GROQ_API_KEY")
    
    prompt = (
        f"Generate a detailed {req.days}-day travel itinerary for {req.destination} "
        f"with a total budget of ₹{req.budget} under a {req.travel_style} travel style. "
        f"Return ONLY valid JSON matching this structure: "
        f'{{"title": "{req.destination} Exploration", "total_budget": {req.budget}, '
        f'"stops": [{{"city_name": "{req.destination}", "start_date": "Day 1", "end_date": "Day {req.days}"}}], '
        f'"activities": [{{"name": "Sample Activity", "category": "activities", "cost": 1000.0, "day_number": 1}}]}}'
    )

    if groq_api_key:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {groq_api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "llama-3.3-70b-versatile",
                        "messages": [
                            {"role": "system", "content": "You are GlobeTrotter AI, an expert luxury travel itinerary planner. Respond only in strict JSON."},
                            {"role": "user", "content": prompt}
                        ],
                        "temperature": 0.7,
                        "response_format": {"type": "json_object"}
                    }
                )
                if resp.status_code == 200:
                    result = resp.json()
                    content = result["choices"][0]["message"]["content"]
                    return json.loads(content)
        except Exception as e:
            print(f"Groq API call fallback triggered: {e}")

    # Smart Rule-Based Fallback Generator
    per_day_budget = req.budget / req.days if req.days > 0 else req.budget
    stay_cost = round(per_day_budget * 0.4, 2)
    meal_cost = round(per_day_budget * 0.25, 2)
    activity_cost = round(per_day_budget * 0.25, 2)
    transport_cost = round(per_day_budget * 0.1, 2)

    activities = []
    for day in range(1, req.days + 1):
        activities.extend([
            {"name": f"Hotel Stay & Breakfast (Day {day})", "category": "stay", "cost": stay_cost, "day_number": day},
            {"name": f"Local Transport & Transfers (Day {day})", "category": "transport", "cost": transport_cost, "day_number": day},
            {"name": f"Guided City Sightseeing & Landmark Tour (Day {day})", "category": "activities", "cost": activity_cost, "day_number": day},
            {"name": f"Gourmet Dining & Culinary Experience (Day {day})", "category": "meals", "cost": meal_cost, "day_number": day}
        ])

    return {
        "title": f"{req.destination} {req.travel_style.capitalize()} Journey",
        "total_budget": req.budget,
        "stops": [
            {
                "city_name": req.destination,
                "start_date": "Day 1",
                "end_date": f"Day {req.days}"
            }
        ],
        "activities": activities,
        "is_public": False
    }

# Static file serving
BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"

if FRONTEND_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIR / "assets")), name="assets")
    app.mount("/css", StaticFiles(directory=str(FRONTEND_DIR / "css")), name="css")
    app.mount("/js", StaticFiles(directory=str(FRONTEND_DIR / "js")), name="js")

    @app.get("/")
    async def serve_index():
        return FileResponse(str(FRONTEND_DIR / "index.html"))

    @app.get("/{page_name}.html")
    async def serve_html(page_name: str):
        file_path = FRONTEND_DIR / f"{page_name}.html"
        if file_path.exists():
            return FileResponse(str(file_path))
        raise HTTPException(status_code=404, detail="Page not found")
