from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class CognitiveAssessmentSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    mmse_score: Optional[float] = Field(None, ge=0, le=30, description="Mini-Mental State Exam score (0-30)")
    moca_score: Optional[float] = Field(None, ge=0, le=30, description="Montreal Cognitive Assessment score (0-30)")
    cognitive_decline_indicator: Optional[bool] = False
    memory_decline_flag: Optional[bool] = False
    executive_fn_score: Optional[float] = None

class ClinicalIndicatorsSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    comorbidities_count: Optional[int] = 0
    hypertension: Optional[bool] = False
    diabetes: Optional[bool] = False
    smoking_history: Optional[bool] = False
    family_history_alzheimers: Optional[bool] = False

class BloodMarkersSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    abeta_42_44_ratio: Optional[float] = None
    ptau_181: Optional[float] = None
    ptau_217: Optional[float] = None
    nfl: Optional[float] = None
    apoe4_carrier: Optional[bool] = False

class ImagingFeaturesSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    hippocampal_volume_mm3: Optional[float] = None
    entorhinal_cortical_thickness: Optional[float] = None
    ventricle_volume_ratio: Optional[float] = None
    mri_completed: Optional[bool] = False

class FactorContribution(BaseModel):
    factor_name: str
    points: float
    percentage: float
    description: str

class PrioritizationResultSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    priority_score: float = Field(..., ge=0, le=100)
    priority_level: str # HIGH, MEDIUM, LOW
    key_contributing_factor: str
    recommended_next_stage: str
    model_version: str = "baseline-rf-v1.0"
    generated_at: Optional[datetime] = None
    factor_contributions: Optional[List[FactorContribution]] = []

class PatientBase(BaseModel):
    patient_id: str
    age: int = Field(..., ge=18, le=120)
    sex: Optional[str] = "M"
    current_stage: str = "Cognitive Screening"
    review_status: str = "Pending Review"

class PatientCreate(PatientBase):
    cognitive_assessment: Optional[CognitiveAssessmentSchema] = None
    clinical_indicators: Optional[ClinicalIndicatorsSchema] = None
    blood_markers: Optional[BloodMarkersSchema] = None
    imaging_features: Optional[ImagingFeaturesSchema] = None

class PatientResponse(PatientBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
    cognitive_assessment: Optional[CognitiveAssessmentSchema] = None
    clinical_indicators: Optional[ClinicalIndicatorsSchema] = None
    blood_markers: Optional[BloodMarkersSchema] = None
    imaging_features: Optional[ImagingFeaturesSchema] = None
    prioritization_result: Optional[PrioritizationResultSchema] = None

class PatientListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    patients: List[PatientResponse]
