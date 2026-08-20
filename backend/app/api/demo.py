from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import Patient, User
from app.services.synthetic_data import generate_synthetic_patients
from app.services.patient_service import create_patient_record
from app.ml.model_store import get_ml_model
from app.services.audit_service import log_action
from app.api.auth_deps import get_current_user

router = APIRouter()

@router.post("/generate")
def generate_demo_cohort(
    count: int = Query(248, ge=10, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Wipe existing
    db.query(Patient).delete()
    db.flush()

    raw_patients = generate_synthetic_patients(count)
    model = get_ml_model()
    model.train(raw_patients)

    for p_dict in raw_patients:
        create_patient_record(db, p_dict, model=model)

    db.commit()

    log_action(db, user=current_user.email, action="Generate Synthetic Cohort", resource=f"Cohort count: {count}", details="Reset database with synthetic demonstration data.")

    return {
        "status": "success",
        "patient_count": count,
        "message": f"Successfully generated synthetic cohort of {count} patients with trained prioritization model.",
        "benchmark_patient": "P-1042"
    }
