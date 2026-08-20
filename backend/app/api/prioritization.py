from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.database.connection import get_db
from app.database.models import Patient, PrioritizationResult, User
from app.schemas.prioritization import PrioritizationRunRequest, PrioritizationRunResponse, ThresholdConfig
from app.ml.model_store import get_ml_model
from app.services.pathway_engine import recommend_next_stage
from app.services.audit_service import log_action
from app.api.auth_deps import get_current_user
from app.utils.config import settings

router = APIRouter()

@router.post("/run", response_model=PrioritizationRunResponse)
def run_prioritization(
    payload: PrioritizationRunRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    model = get_ml_model()
    query = db.query(Patient)
    if payload.patient_ids:
        query = query.filter(Patient.patient_id.in_(payload.patient_ids))

    patients = query.all()
    if not patients:
        raise HTTPException(status_code=404, detail="No matching patients found for prioritization.")

    high_c, med_c, low_c = 0, 0, 0

    for p in patients:
        p_dict = {
            "patient_id": p.patient_id,
            "age": p.age,
            "sex": p.sex,
            "current_stage": p.current_stage,
            "review_status": p.review_status,
            "cognitive_assessment": {
                "mmse_score": p.cognitive_assessment.mmse_score if p.cognitive_assessment else None,
                "moca_score": p.cognitive_assessment.moca_score if p.cognitive_assessment else None,
                "cognitive_decline_indicator": p.cognitive_assessment.cognitive_decline_indicator if p.cognitive_assessment else False,
                "memory_decline_flag": p.cognitive_assessment.memory_decline_flag if p.cognitive_assessment else False,
                "executive_fn_score": p.cognitive_assessment.executive_fn_score if p.cognitive_assessment else None,
            },
            "clinical_indicators": {
                "comorbidities_count": p.clinical_indicators.comorbidities_count if p.clinical_indicators else 0,
                "hypertension": p.clinical_indicators.hypertension if p.clinical_indicators else False,
                "diabetes": p.clinical_indicators.diabetes if p.clinical_indicators else False,
                "smoking_history": p.clinical_indicators.smoking_history if p.clinical_indicators else False,
                "family_history_alzheimers": p.clinical_indicators.family_history_alzheimers if p.clinical_indicators else False,
            },
            "blood_markers": {
                "abeta_42_44_ratio": p.blood_markers.abeta_42_44_ratio if p.blood_markers else None,
                "ptau_181": p.blood_markers.ptau_181 if p.blood_markers else None,
                "ptau_217": p.blood_markers.ptau_217 if p.blood_markers else None,
                "nfl": p.blood_markers.nfl if p.blood_markers else None,
                "apoe4_carrier": p.blood_markers.apoe4_carrier if p.blood_markers else False,
            },
            "imaging_features": {
                "hippocampal_volume_mm3": p.imaging_features.hippocampal_volume_mm3 if p.imaging_features else None,
                "entorhinal_cortical_thickness": p.imaging_features.entorhinal_cortical_thickness if p.imaging_features else None,
                "ventricle_volume_ratio": p.imaging_features.ventricle_volume_ratio if p.imaging_features else None,
                "mri_completed": p.imaging_features.mri_completed if p.imaging_features else False,
            }
        }

        score, level, key_factor, factor_contribs = model.predict_patient(p_dict)
        next_stage = recommend_next_stage(p.current_stage, level, score)

        if level == "HIGH": high_c += 1
        elif level == "MEDIUM": med_c += 1
        else: low_c += 1

        if p.prioritization_result:
            p.prioritization_result.priority_score = score
            p.prioritization_result.priority_level = level
            p.prioritization_result.key_contributing_factor = key_factor
            p.prioritization_result.recommended_next_stage = next_stage
            p.prioritization_result.generated_at = datetime.now(timezone.utc)
            p.prioritization_result.factor_contributions_json = factor_contribs
        else:
            res = PrioritizationResult(
                patient_id=p.patient_id,
                priority_score=score,
                priority_level=level,
                key_contributing_factor=key_factor,
                recommended_next_stage=next_stage,
                model_version=model.model_version,
                factor_contributions_json=factor_contribs
            )
            db.add(res)

    db.commit()

    log_action(db, user=current_user.email, action="Run Batch Prioritization", resource=f"Processed {len(patients)} records")

    return PrioritizationRunResponse(
        processed_count=len(patients),
        high_count=high_c,
        medium_count=med_c,
        low_count=low_c,
        generated_at=datetime.now(timezone.utc).isoformat(),
        message="Prioritization score recalculation completed successfully."
    )

@router.get("/thresholds", response_model=ThresholdConfig)
def get_threshold_config():
    return ThresholdConfig(
        low_max=settings.THRESHOLD_LOW_MAX,
        medium_max=settings.THRESHOLD_MEDIUM_MAX
    )
