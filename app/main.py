import os
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.encoders import jsonable_encoder
from bson import ObjectId
from app.database import trips_collection, catalog_collection
from app.models import TripCreate

app = FastAPI(title="GlobeTrotter API")

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

# API Endpoints
@app.get("/health")
def health():
    return {"status": "ok"}

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
