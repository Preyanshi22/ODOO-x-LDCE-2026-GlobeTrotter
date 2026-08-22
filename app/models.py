from pydantic import BaseModel, Field
from typing import List, Optional

class Activity(BaseModel):
    id: Optional[str] = None
    name: str
    category: str = "activities"
    cost: float = Field(default=0.0, ge=0)
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
    total_budget: float = Field(default=0.0, ge=0)
    stops: List[Stop] = []
    activities: List[Activity] = []
    is_public: bool = False

class TripUpdate(BaseModel):
    title: Optional[str] = None
    user_id: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    total_budget: Optional[float] = Field(default=None, ge=0)
    stops: Optional[List[Stop]] = None
    activities: Optional[List[Activity]] = None
    is_public: Optional[bool] = None

class AIGenerateRequest(BaseModel):
    destination: str
    days: int = Field(default=5, ge=1, le=30)
    budget: float = Field(default=50000.0, ge=0)
    travel_style: str = "balanced"
