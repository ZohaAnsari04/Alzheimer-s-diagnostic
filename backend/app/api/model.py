from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import Patient, User
from app.ml.model_store import get_ml_model
from app.services.patient_service import seed_database_if_empty
from app.services.synthetic_data import generate_synthetic_patients
from app.services.audit_service import log_action
from app.api.auth_deps import get_current_user, require_role
from app.services.notification_service import notify_model_evaluation_complete

router = APIRouter()

def _ensure_model_trained(model, db: Session):
    seed_database_if_empty(db)
    if not model.is_trained or not model.metrics_cache:
        patients = db.query(Patient).all()
        raw_patients = []
        for p in patients:
            raw_patients.append({
                "patient_id": p.patient_id,
                "age": p.age,
                "sex": p.sex,
                "current_stage": p.current_stage,
                "cognitive_assessment": {"mmse_score": p.cognitive_assessment.mmse_score if p.cognitive_assessment else None, "moca_score": p.cognitive_assessment.moca_score if p.cognitive_assessment else None, "cognitive_decline_indicator": p.cognitive_assessment.cognitive_decline_indicator if p.cognitive_assessment else False, "memory_decline_flag": p.cognitive_assessment.memory_decline_flag if p.cognitive_assessment else False, "executive_fn_score": p.cognitive_assessment.executive_fn_score if p.cognitive_assessment else None},
                "clinical_indicators": {"comorbidities_count": p.clinical_indicators.comorbidities_count if p.clinical_indicators else 0, "family_history_alzheimers": p.clinical_indicators.family_history_alzheimers if p.clinical_indicators else False},
                "blood_markers": {"abeta_42_44_ratio": p.blood_markers.abeta_42_44_ratio if p.blood_markers else None, "ptau_181": p.blood_markers.ptau_181 if p.blood_markers else None, "apoe4_carrier": p.blood_markers.apoe4_carrier if p.blood_markers else False},
                "imaging_features": {"hippocampal_volume_mm3": p.imaging_features.hippocampal_volume_mm3 if p.imaging_features else None, "entorhinal_cortical_thickness": p.imaging_features.entorhinal_cortical_thickness if p.imaging_features else None}
            })
        if not raw_patients:
            raw_patients = generate_synthetic_patients(50)
        model.train(raw_patients)

@router.get("/metrics")
def get_model_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    model = get_ml_model()
    _ensure_model_trained(model, db)
    return {
        "metrics": model.metrics_cache,
        "feature_importances": model.get_global_feature_importances(),
        "fairness_audit": model.fairness_cache or [],
        "transparency_card": {
            "model_type": model.metrics_cache.get("model_type", "Interpretable Classifier"),
            "dataset": "Synthetic Cohort (ADNI / OASIS benchmark schema)",
            "purpose": "Patient prioritization decision support",
            "output": "Diagnostic Prioritization Score (0-100)",
            "clinical_status": "Prototype Decision Support — Not Clinically Validated",
            "disclaimer": "This ML model outputs a relative risk prioritization score to assist resource allocation. It does NOT provide a diagnosis or treatment recommendation."
        }
    }

@router.get("/explainability/{patient_id}")
def get_patient_explainability(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    seed_database_if_empty(db)
    patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient '{patient_id}' not found.")

    res = patient.prioritization_result
    if not res:
        raise HTTPException(status_code=404, detail=f"No prioritization result found for patient '{patient_id}'.")

    return {
        "patient_id": patient_id,
        "priority_score": res.priority_score,
        "priority_level": res.priority_level,
        "key_contributing_factor": res.key_contributing_factor,
        "recommended_next_stage": res.recommended_next_stage,
        "factor_contributions": res.factor_contributions_json or [],
        "disclaimer": "Factor contributions are derived from model scoring logic for decision transparency. Not a diagnostic probability breakdown."
    }

@router.post("/algorithm")
def change_model_algorithm(
    algorithm: str = Query("random_forest", description="random_forest, gradient_boosting, or logistic_regression"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN"))
):
    model = get_ml_model()
    model.set_algorithm(algorithm)
    
    patients = db.query(Patient).all()
    raw_patients = []
    for p in patients:
        raw_patients.append({
            "patient_id": p.patient_id,
            "age": p.age,
            "sex": p.sex,
            "current_stage": p.current_stage,
            "cognitive_assessment": {"mmse_score": p.cognitive_assessment.mmse_score if p.cognitive_assessment else None, "moca_score": p.cognitive_assessment.moca_score if p.cognitive_assessment else None, "cognitive_decline_indicator": p.cognitive_assessment.cognitive_decline_indicator if p.cognitive_assessment else False, "memory_decline_flag": p.cognitive_assessment.memory_decline_flag if p.cognitive_assessment else False, "executive_fn_score": p.cognitive_assessment.executive_fn_score if p.cognitive_assessment else None},
            "clinical_indicators": {"comorbidities_count": p.clinical_indicators.comorbidities_count if p.clinical_indicators else 0, "family_history_alzheimers": p.clinical_indicators.family_history_alzheimers if p.clinical_indicators else False},
            "blood_markers": {"abeta_42_44_ratio": p.blood_markers.abeta_42_44_ratio if p.blood_markers else None, "ptau_181": p.blood_markers.ptau_181 if p.blood_markers else None, "apoe4_carrier": p.blood_markers.apoe4_carrier if p.blood_markers else False},
            "imaging_features": {"hippocampal_volume_mm3": p.imaging_features.hippocampal_volume_mm3 if p.imaging_features else None, "entorhinal_cortical_thickness": p.imaging_features.entorhinal_cortical_thickness if p.imaging_features else None}
        })
    if not raw_patients:
        raw_patients = generate_synthetic_patients(50)
    model.train(raw_patients)

    auc = model.metrics_cache.get("roc_auc") if model.metrics_cache else None
    notify_model_evaluation_complete(db, user_id=current_user.id, model_type=algorithm.replace("_", " ").title(), roc_auc=auc)

    log_action(db, user=current_user.email, action="Algorithm Switch", resource=f"Algorithm: {algorithm}", details=f"Switched ML algorithm to {algorithm} and re-evaluated model.")
    return {
        "status": "success",
        "algorithm": algorithm,
        "metrics": model.metrics_cache,
        "message": f"ML model algorithm updated to {algorithm}."
    }
