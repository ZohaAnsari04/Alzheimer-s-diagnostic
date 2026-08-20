from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class DashboardSummary(BaseModel):
    total_screened: int
    high_priority: int
    medium_priority: int
    low_priority: int
    mri_candidates: int
    pet_candidates: int
    biomarker_candidates: int
    pending_review: int
    completed_review: int

class StageCount(BaseModel):
    stage: str
    count: int
    percentage: float
    candidates_awaiting_review: int

class PriorityDistribution(BaseModel):
    level: str
    count: int
    percentage: float

class FunnelStep(BaseModel):
    stage: str
    count: int
    conversion_rate: float # Percentage of total cohort reaching or recommended for this stage

class AnalyticsResponse(BaseModel):
    summary: DashboardSummary
    priority_distribution: List[PriorityDistribution]
    stage_breakdown: List[StageCount]
    funnel: List[FunnelStep]
    recommended_next_stages: List[Dict[str, Any]]
    score_histogram: List[Dict[str, Any]]
    age_distribution: List[Dict[str, Any]]
    missing_data_summary: List[Dict[str, Any]]

class ResourceCapacityConfig(BaseModel):
    mri_daily_capacity: int = 15
    pet_daily_capacity: int = 5
    biomarker_daily_capacity: int = 40

class ResourceCapacityResponse(BaseModel):
    config: ResourceCapacityConfig
    mri_demand: int
    pet_demand: int
    biomarker_demand: int
    mri_utilization_pct: float
    pet_utilization_pct: float
    biomarker_utilization_pct: float
    mri_wait_days: float
    pet_wait_days: float
    disclaimer: str = "Prototype planning capacity — does not represent real hospital operational data."
