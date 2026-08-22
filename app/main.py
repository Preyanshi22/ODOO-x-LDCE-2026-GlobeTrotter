import os
import json
import time
import httpx
import hashlib
import hmac
import secrets
import base64
import asyncio
from pathlib import Path
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.encoders import jsonable_encoder
from bson import ObjectId
from app.database import trips_collection, catalog_collection, users_collection
from app.models import TripCreate, TripUpdate, Activity, AIGenerateRequest, UserRegister, UserLogin

JWT_SECRET = os.getenv("JWT_SECRET", "globetrotter_luxury_travel_sec_2026")

# In-Memory Fast Memory Cache Fallback for instant responses
MEM_USERS = {}
MEM_TRIPS = []
MEM_POSTS = [
    {
        "id": "post_seed",
        "user": "Aarav Mehta",
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        "destination": "Kyoto, Japan",
        "tripName": "Zen Gardens Explorer",
        "body": "The golden pavilion was amazing at sunset! Highly recommend taking the path less traveled.",
        "image": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
        "likes": 42,
        "comments": 8,
        "createdAt": "1 hour ago"
    }
]

def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000).hex()
    return f"{salt}${pwd_hash}"

def verify_password(password: str, stored_hash: str) -> bool:
    try:
        salt, pwd_hash = stored_hash.split('$')
        computed_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000).hex()
        return hmac.compare_digest(pwd_hash, computed_hash)
    except Exception:
        return False

def create_jwt_token(user_id: str, email: str) -> str:
    header = base64.urlsafe_b64encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode()).decode().rstrip('=')
    payload = base64.urlsafe_b64encode(json.dumps({
        "sub": user_id,
        "email": email,
        "exp": int(time.time()) + 86400 * 30
    }).encode()).decode().rstrip('=')
    
    signature = hmac.new(JWT_SECRET.encode(), f"{header}.{payload}".encode(), hashlib.sha256).digest()
    sig_b64 = base64.urlsafe_b64encode(signature).decode().rstrip('=')
    return f"{header}.{payload}.{sig_b64}"

app = FastAPI(
    title="GlobeTrotter API",
    description="Backend service for luxury travel planning, budget management, user authentication, and AI itinerary generation.",
    version="1.4.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def format_doc(doc):
    if not doc:
        return None
    doc["id"] = str(doc.get("_id", doc.get("id")))
    if "_id" in doc:
        del doc["_id"]
    return doc

# Health Check Endpoint
@app.get("/health")
def health():
    return {"status": "ok", "service": "GlobeTrotter API"}

# Complete Auth Endpoints
@app.post("/api/auth/register")
async def register_user(user: UserRegister):
    data = jsonable_encoder(user)
    email = user.email.lower()

    # Fast Memory check
    if email in MEM_USERS:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    
    raw_password = data["password"]
    pwd_hash = hash_password(raw_password)
    data["password_hash"] = pwd_hash
    del data["password"]
    data["created_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    user_id = f"usr_{secrets.token_hex(8)}"
    data["id"] = user_id
    MEM_USERS[email] = data

    # Async background attempt to persist to Mongo Atlas without blocking request
    async def try_mongo_insert():
        try:
            await asyncio.wait_for(users_collection.insert_one({**data}), timeout=3.0)
        except Exception as e:
            print("MongoDB async insert notice:", e)

    asyncio.create_task(try_mongo_insert())

    res_user = {k: v for k, v in data.items() if k != "password_hash"}
    token = create_jwt_token(user_id, email)
    return {"status": "success", "token": token, "user": res_user}

@app.post("/api/auth/login")
async def login_user(user_cred: UserLogin):
    email = user_cred.email.lower()
    user_doc = MEM_USERS.get(email)

    if not user_doc:
        # Check Mongo Atlas with short timeout
        try:
            doc = await asyncio.wait_for(users_collection.find_one({"email": email}), timeout=2.0)
            if doc:
                user_doc = format_doc(doc)
                MEM_USERS[email] = user_doc
        except Exception:
            pass

    if not user_doc:
        # Auto seed demo user if logging in with demo credentials
        if email == "aarav@globetrotter.app":
            demo_user = {
                "id": "usr_demo123",
                "first_name": "Aarav",
                "last_name": "Mehta",
                "email": "aarav@globetrotter.app",
                "phone": "+91 98765 43210",
                "city": "Bengaluru",
                "country": "India",
                "password_hash": hash_password(user_cred.password),
                "profile_photo": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
                "additional_info": "Passionate travel photographer & culture enthusiast."
            }
            MEM_USERS[email] = demo_user
            user_doc = demo_user
        else:
            raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    stored_hash = user_doc.get("password_hash")
    if stored_hash and not verify_password(user_cred.password, stored_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    res_user = {k: v for k, v in user_doc.items() if k != "password_hash"}
    user_id = res_user.get("id", "usr_demo123")
    token = create_jwt_token(user_id, email)
    return {"status": "success", "token": token, "user": res_user}

@app.get("/api/auth/me")
async def get_user_profile(email: str = Query(...)):
    e = email.lower()
    u = MEM_USERS.get(e)
    if not u:
        try:
            doc = await asyncio.wait_for(users_collection.find_one({"email": e}), timeout=2.0)
            if doc:
                u = format_doc(doc)
                MEM_USERS[e] = u
        except Exception:
            pass

    if not u:
        raise HTTPException(status_code=404, detail="User profile not found")
    
    return {k: v for k, v in u.items() if k != "password_hash"}

# API Endpoints for Trips
@app.get("/api/trips")
async def get_trips(user_id: str = Query(None)):
    trips = []
    try:
        query = {"user_id": user_id} if user_id else {}
        cursor = trips_collection.find(query)
        async for doc in cursor:
            trips.append(format_doc(doc))
    except Exception:
        pass
    
    # Combine with in-memory trips
    if user_id:
        user_mem_trips = [t for t in MEM_TRIPS if t.get("user_id") == user_id]
        trips.extend(user_mem_trips)
    else:
        trips.extend(MEM_TRIPS)

    return trips

@app.post("/api/trips")
async def create_trip(trip: TripCreate):
    data = jsonable_encoder(trip)
    trip_id = f"trip_{secrets.token_hex(6)}"
    data["id"] = trip_id
    MEM_TRIPS.append(data)

    async def try_mongo_insert():
        try:
            await asyncio.wait_for(trips_collection.insert_one({**data}), timeout=3.0)
        except Exception:
            pass

    asyncio.create_task(try_mongo_insert())
    return data

@app.get("/api/trips/{trip_id}")
async def get_trip(trip_id: str):
    mem_t = next((t for t in MEM_TRIPS if t.get("id") == trip_id), None)
    if mem_t:
        return mem_t

    try:
        doc = await asyncio.wait_for(trips_collection.find_one({"_id": ObjectId(trip_id)}), timeout=2.0)
        if doc:
            return format_doc(doc)
    except Exception:
        pass
    
    raise HTTPException(status_code=404, detail="Trip not found")

@app.put("/api/trips/{trip_id}")
async def update_trip(trip_id: str, trip_update: TripUpdate):
    update_data = {k: v for k, v in jsonable_encoder(trip_update).items() if v is not None}
    
    for t in MEM_TRIPS:
        if t.get("id") == trip_id:
            t.update(update_data)
            return t

    try:
        obj_id = ObjectId(trip_id)
        await trips_collection.update_one({"_id": obj_id}, {"$set": update_data})
        updated_doc = await trips_collection.find_one({"_id": obj_id})
        if updated_doc:
            return format_doc(updated_doc)
    except Exception:
        pass

    raise HTTPException(status_code=404, detail="Trip not found")

@app.delete("/api/trips/{trip_id}")
async def delete_trip(trip_id: str):
    global MEM_TRIPS
    MEM_TRIPS = [t for t in MEM_TRIPS if t.get("id") != trip_id]

    try:
        obj_id = ObjectId(trip_id)
        await trips_collection.delete_one({"_id": obj_id})
    except Exception:
        pass

    return {"status": "success", "message": f"Trip {trip_id} deleted successfully"}

# Public Shared Itinerary Endpoints
@app.get("/api/shared-itinerary/{trip_id}")
async def get_shared_itinerary(trip_id: str):
    mem_t = next((t for t in MEM_TRIPS if t.get("id") == trip_id), None)
    if mem_t:
        return {
            "id": mem_t.get("id"),
            "title": mem_t.get("title") or mem_t.get("name") or "Public Shared Itinerary",
            "name": mem_t.get("name") or mem_t.get("title") or "Public Shared Itinerary",
            "description": mem_t.get("description", "Curated travel itinerary."),
            "start_date": mem_t.get("start_date") or mem_t.get("startDate") or "2026-09-01",
            "end_date": mem_t.get("end_date") or mem_t.get("endDate") or "2026-09-05",
            "cover": mem_t.get("cover") or "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1200&q=85",
            "total_budget": mem_t.get("total_budget") or mem_t.get("budget", {}).get("total", 50000),
            "stops": mem_t.get("stops", []),
            "activities": mem_t.get("activities", []),
            "is_public": True
        }

    try:
        doc = await asyncio.wait_for(trips_collection.find_one({"_id": ObjectId(trip_id)}), timeout=2.0)
        if doc:
            formatted = format_doc(doc)
            return {
                "id": formatted.get("id"),
                "title": formatted.get("title") or formatted.get("name") or "Public Shared Itinerary",
                "name": formatted.get("name") or formatted.get("title") or "Public Shared Itinerary",
                "description": formatted.get("description", "Curated travel itinerary."),
                "start_date": formatted.get("start_date") or formatted.get("startDate") or "2026-09-01",
                "end_date": formatted.get("end_date") or formatted.get("endDate") or "2026-09-05",
                "cover": formatted.get("cover") or "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1200&q=85",
                "total_budget": formatted.get("total_budget") or formatted.get("budget", {}).get("total", 50000),
                "stops": formatted.get("stops", []),
                "activities": formatted.get("activities", []),
                "is_public": True
            }
    except Exception:
        pass

    raise HTTPException(status_code=404, detail="Public itinerary not found or unavailable")

@app.post("/api/shared-itinerary/{trip_id}/copy")
async def copy_shared_itinerary(trip_id: str, request: Request):
    body = {}
    try:
        body = await request.json()
    except Exception:
        pass
    
    target_user_id = body.get("user_id", "authenticated_user")
    
    original = next((t for t in MEM_TRIPS if t.get("id") == trip_id), None)
    if not original:
        try:
            doc = await asyncio.wait_for(trips_collection.find_one({"_id": ObjectId(trip_id)}), timeout=2.0)
            if doc:
                original = format_doc(doc)
        except Exception:
            pass

    if not original:
        raise HTTPException(status_code=404, detail="Original itinerary not found to copy")

    new_id = f"trip_{secrets.token_hex(6)}"
    copied_trip = {
        **original,
        "id": new_id,
        "title": f"{original.get('title') or original.get('name') or 'Trip'} (Copy)",
        "name": f"{original.get('name') or original.get('title') or 'Trip'} (Copy)",
        "user_id": target_user_id,
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }
    
    MEM_TRIPS.append(copied_trip)

    async def try_mongo_insert():
        try:
            await asyncio.wait_for(trips_collection.insert_one({**copied_trip}), timeout=3.0)
        except Exception:
            pass

    asyncio.create_task(try_mongo_insert())
    return copied_trip

@app.post("/api/trips/{trip_id}/activities")
async def add_activity(trip_id: str, activity: Activity):
    act_data = jsonable_encoder(activity)

    for t in MEM_TRIPS:
        if t.get("id") == trip_id:
            if "activities" not in t:
                t["activities"] = []
            t["activities"].append(act_data)
            return t

    try:
        obj_id = ObjectId(trip_id)
        await trips_collection.update_one({"_id": obj_id}, {"$push": {"activities": act_data}})
        updated_doc = await trips_collection.find_one({"_id": obj_id})
        if updated_doc:
            return format_doc(updated_doc)
    except Exception:
        pass

    raise HTTPException(status_code=404, detail="Trip not found")

@app.get("/api/trips/{trip_id}/budget")
async def get_trip_budget(trip_id: str):
    trip_data = next((t for t in MEM_TRIPS if t.get("id") == trip_id), None)
    
    if not trip_data:
        try:
            doc = await asyncio.wait_for(trips_collection.find_one({"_id": ObjectId(trip_id)}), timeout=2.0)
            if doc:
                trip_data = format_doc(doc)
        except Exception:
            pass

    if not trip_data:
        raise HTTPException(status_code=404, detail="Trip not found")

    categories = {"transport": 0.0, "stay": 0.0, "activities": 0.0, "meals": 0.0}
    for act in trip_data.get("activities", []):
        cat = act.get("category", "activities").lower()
        cost = float(act.get("cost", 0.0))
        if cat in categories:
            categories[cat] += cost
        else:
            categories["activities"] += cost

    total_spent = sum(categories.values())
    total_budget = float(trip_data.get("total_budget", 50000.0))

    return {
        "categories": categories,
        "total_spent": total_spent,
        "total_budget": total_budget,
        "remaining": max(0.0, total_budget - total_spent),
        "is_overbudget": total_spent > total_budget
    }

@app.get("/api/catalog/destinations")
async def get_destination_catalog():
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

from fastapi import Request

@app.get("/api/community")
async def get_community_posts():
    return MEM_POSTS

@app.post("/api/community")
async def create_community_post(request: Request):
    data = await request.json()
    post_id = f"post_{secrets.token_hex(6)}"
    data["id"] = post_id
    if "likes" not in data:
        data["likes"] = 0
    if "comments" not in data:
        data["comments"] = 0
    if "createdAt" not in data:
        data["createdAt"] = "Just now"
    MEM_POSTS.insert(0, data)
    return data

@app.put("/api/auth/profile")
async def update_user_profile(request: Request):
    data = await request.json()
    email = data.get("email", "").lower()
    if email in MEM_USERS:
        MEM_USERS[email].update(data)
        async def try_mongo_update():
            try:
                await asyncio.wait_for(users_collection.update_one({"email": email}, {"$set": data}), timeout=2.0)
            except Exception:
                pass
        asyncio.create_task(try_mongo_update())
        return MEM_USERS[email]
    
    # Check mongo just in case
    try:
        doc = await asyncio.wait_for(users_collection.find_one({"email": email}), timeout=2.0)
        if doc:
            MEM_USERS[email] = format_doc(doc)
            MEM_USERS[email].update(data)
            async def try_mongo_update():
                try:
                    await asyncio.wait_for(users_collection.update_one({"email": email}, {"$set": data}), timeout=2.0)
                except Exception:
                    pass
            asyncio.create_task(try_mongo_update())
            return MEM_USERS[email]
    except Exception:
        pass

    raise HTTPException(status_code=404, detail="User not found")

@app.get("/api/admin/stats")
async def get_admin_stats():
    return {
        "users": len(MEM_USERS),
        "trips": len(MEM_TRIPS),
        "posts": len(MEM_POSTS)
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
