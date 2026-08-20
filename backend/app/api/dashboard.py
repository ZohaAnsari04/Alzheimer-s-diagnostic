from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import Patient, PrioritizationResult, User
from app.schemas.analytics import DashboardSummary
from app.services.patient_service import seed_database_if_empty
from app.api.auth_deps import get_current_user

router = APIRouter()

@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    seed_database_if_empty(db)

    total_screened = db.query(Patient).count()
    high_priority = db.query(PrioritizationResult).filter(PrioritizationResult.priority_level == "HIGH").count()
    medium_priority = db.query(PrioritizationResult).filter(PrioritizationResult.priority_level == "MEDIUM").count()
    low_priority = db.query(PrioritizationResult).filter(PrioritizationResult.priority_level == "LOW").count()

    mri_candidates = db.query(PrioritizationResult).filter(PrioritizationResult.recommended_next_stage == "MRI Evaluation").count()
    pet_candidates = db.query(PrioritizationResult).filter(PrioritizationResult.recommended_next_stage.ilike("%PET%")).count()
    biomarker_candidates = db.query(PrioritizationResult).filter(PrioritizationResult.recommended_next_stage.ilike("%Biomarker%")).count()

    pending_review = db.query(Patient).filter(Patient.review_status == "Pending Review").count()
    completed_review = db.query(Patient).filter(Patient.review_status == "Completed").count()

    return DashboardSummary(
        total_screened=total_screened,
        high_priority=high_priority,
        medium_priority=medium_priority,
        low_priority=low_priority,
        mri_candidates=mri_candidates,
        pet_candidates=pet_candidates,
        biomarker_candidates=biomarker_candidates,
        pending_review=pending_review,
        completed_review=completed_review
    )
