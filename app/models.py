from pydantic import BaseModel
from typing import List, Optional

class Activity(BaseModel):
    name: str
    category: str = "activities"
    cost: float = 0.0
    day_number: int = 1

class Stop(BaseModel):
    city_name: str
    start_date: str
    end_date: str

class TripCreate(BaseModel):
    title: str
    user_id: str = "demo_user"
    start_date: str
    end_date: str
    total_budget: float
    stops: List[Stop] = []
    activities: List[Activity] = []
    is_public: bool = False
