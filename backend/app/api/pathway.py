from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import Patient, User
from app.services.pathway_engine import recommend_next_stage
from app.api.auth_deps import get_current_user

router = APIRouter()

@router.get("/{patient_id}")
def get_patient_pathway(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient '{patient_id}' not found.")

    res = patient.prioritization_result
    p_score = res.priority_score if res else 50.0
    p_level = res.priority_level if res else "MEDIUM"

    current = patient.current_stage
    recommended_next = recommend_next_stage(current, p_level, p_score)

    all_stages = [
        "Cognitive Screening",
        "Blood-Based Biomarkers",
        "MRI Evaluation",
        "PET Scan Prioritization"
    ]

    timeline = []
    current_idx = all_stages.index(current) if current in all_stages else 0

    for idx, stage in enumerate(all_stages):
        if idx < current_idx:
            status = "Completed"
        elif idx == current_idx:
            status = "Current Stage"
        elif idx == current_idx + 1 and recommended_next != "Continue Screening Review":
            status = "Recommended Next Stage"
        else:
            status = "Future Stage"

        timeline.append({
            "stage_index": idx + 1,
            "stage_name": stage,
            "status": status,
            "is_current": (idx == current_idx),
            "is_recommended": (stage == recommended_next or (recommended_next.startswith(stage)))
        })

    return {
        "patient_id": patient_id,
        "current_stage": current,
        "priority_score": p_score,
        "priority_level": p_level,
        "recommended_next_stage": recommended_next,
        "timeline": timeline,
        "disclaimer": "Prototype workflow logic — not a clinical protocol."
    }
