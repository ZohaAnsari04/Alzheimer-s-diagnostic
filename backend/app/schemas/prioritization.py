from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.schemas.patient import FactorContribution, PrioritizationResultSchema

class PrioritizationRunRequest(BaseModel):
    patient_ids: Optional[List[str]] = None # If null, runs for all patients

class PrioritizationRunResponse(BaseModel):
    processed_count: int
    high_count: int
    medium_count: int
    low_count: int
    generated_at: str
    message: str

class ThresholdConfig(BaseModel):
    low_max: float = 39.0
    medium_max: float = 69.0
    disclaimer: str = "Prototype prioritization thresholds — not clinically validated."
