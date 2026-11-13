from pydantic import BaseModel
from typing import List, Dict, Any

class PlatformOverviewStats(BaseModel):
    total_donations: int
    active_donations: int
    completed_donations: int
    total_meals_saved: int
    total_kg_diverted: float
    estimated_co2_offset_kg: float
    total_donors: int
    total_ngos: int
    pending_ngo_verifications: int
    open_reports: int

class CategoryDistribution(BaseModel):
    category: str
    count: int
    percentage: float

class MonthlyTrend(BaseModel):
    month: str
    donations_count: int
    meals_saved: int

class DonorAnalytics(BaseModel):
    total_listed: int
    completed: int
    in_progress: int
    total_kg: float
    total_meals: int
    estimated_co2_saved_kg: float
    positive_feedback_rate: float

class NgoAnalytics(BaseModel):
    total_requested: int
    total_collected: int
    people_served_estimate: int
    total_kg_received: float

