from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any, Tuple
import pandas as pd
import io
from datetime import datetime
from app.database.models import (
    Patient, CognitiveAssessment, ClinicalIndicators, BloodMarkers, ImagingFeatures, PrioritizationResult
)
from app.services.synthetic_data import generate_synthetic_patients
from app.ml.model_store import get_ml_model
from app.services.pathway_engine import recommend_next_stage

def seed_database_if_empty(db: Session):
    count = db.query(Patient).count()
    if count == 0:
        raw_patients = generate_synthetic_patients(248)
        model = get_ml_model()
        model.train(raw_patients)

        for p_dict in raw_patients:
            create_patient_record(db, p_dict, model=model)
        db.commit()

def create_patient_record(db: Session, p_dict: Dict[str, Any], model=None) -> Patient:
    if model is None:
        model = get_ml_model()

    existing = db.query(Patient).filter(Patient.patient_id == p_dict["patient_id"]).first()
    if existing:
        db.delete(existing)
        db.flush()

    patient = Patient(
        patient_id=p_dict["patient_id"],
        age=p_dict["age"],
        sex=p_dict.get("sex", "M"),
        current_stage=p_dict.get("current_stage", "Cognitive Screening"),
        review_status=p_dict.get("review_status", "Pending Review")
    )
    db.add(patient)
    db.flush()

    cog_data = p_dict.get("cognitive_assessment") or {}
    cog = CognitiveAssessment(
        patient_db_id=patient.id,
        mmse_score=cog_data.get("mmse_score"),
        moca_score=cog_data.get("moca_score"),
        cognitive_decline_indicator=cog_data.get("cognitive_decline_indicator", False),
        memory_decline_flag=cog_data.get("memory_decline_flag", False),
        executive_fn_score=cog_data.get("executive_fn_score")
    )
    db.add(cog)

    clin_data = p_dict.get("clinical_indicators") or {}
    clin = ClinicalIndicators(
        patient_db_id=patient.id,
        comorbidities_count=clin_data.get("comorbidities_count", 0),
        family_history_alzheimers=clin_data.get("family_history_alzheimers", False)
    )
    db.add(clin)

    blood_data = p_dict.get("blood_markers") or {}
    blood = BloodMarkers(
        patient_db_id=patient.id,
        abeta_42_44_ratio=blood_data.get("abeta_42_44_ratio"),
        ptau_181=blood_data.get("ptau_181"),
        ptau_217=blood_data.get("ptau_217"),
        nfl=blood_data.get("nfl"),
        apoe4_carrier=blood_data.get("apoe4_carrier", False)
    )
    db.add(blood)

    img_data = p_dict.get("imaging_features") or {}
    img = ImagingFeatures(
        patient_db_id=patient.id,
        hippocampal_volume_mm3=img_data.get("hippocampal_volume_mm3"),
        entorhinal_cortical_thickness=img_data.get("entorhinal_cortical_thickness"),
        ventricle_volume_ratio=img_data.get("ventricle_volume_ratio"),
        mri_taken_flag=img_data.get("mri_taken_flag", False),
        pet_taken_flag=img_data.get("pet_taken_flag", False)
    )
    db.add(img)

    # Run ML prioritization
    score, level, key_factor, factor_contribs = model.predict_patient(p_dict)
    next_stage = recommend_next_stage(patient.current_stage, level, score)

    p_res = PrioritizationResult(
        patient_db_id=patient.id,
        priority_score=score,
        priority_level=level,
        key_contributing_factor=key_factor,
        recommended_next_stage=next_stage,
        model_version=model.model_version,
        factor_contributions_json=factor_contribs
    )
    db.add(p_res)
    return patient

def parse_and_import_csv(content: bytes, db: Session) -> Tuple[int, List[str]]:
    model = get_ml_model()
    try:
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        return 0, [f"Failed to parse CSV file: {str(e)}"]

    required_cols = ["patient_id", "age", "sex"]
    missing = [c for c in required_cols if c not in df.columns]
    if missing:
        return 0, [f"Missing required CSV columns: {', '.join(missing)}"]

    imported_count = 0
    errors = []

    for idx, row in df.iterrows():
        try:
            p_dict = {
                "patient_id": str(row["patient_id"]).strip(),
                "age": int(row["age"]),
                "sex": str(row["sex"]).strip().upper(),
                "current_stage": str(row.get("current_stage", "Cognitive Screening")).strip(),
                "review_status": str(row.get("review_status", "Pending Review")).strip(),
                "cognitive_assessment": {
                    "mmse_score": float(row["mmse_score"]) if pd.notnull(row.get("mmse_score")) else None,
                    "moca_score": float(row["moca_score"]) if pd.notnull(row.get("moca_score")) else None,
                    "cognitive_decline_indicator": bool(row.get("cognitive_decline_indicator", False)),
                    "memory_decline_flag": bool(row.get("memory_decline_flag", False)),
                    "executive_fn_score": float(row["executive_fn_score"]) if pd.notnull(row.get("executive_fn_score")) else None,
                },
                "clinical_indicators": {
                    "comorbidities_count": int(row.get("comorbidities_count", 0)),
                    "family_history_alzheimers": bool(row.get("family_history_alzheimers", False))
                },
                "blood_markers": {
                    "abeta_42_44_ratio": float(row["abeta_42_44_ratio"]) if pd.notnull(row.get("abeta_42_44_ratio")) else None,
                    "ptau_181": float(row["ptau_181"]) if pd.notnull(row.get("ptau_181")) else None,
                    "ptau_217": float(row["ptau_217"]) if pd.notnull(row.get("ptau_217")) else None,
                    "nfl": float(row["nfl"]) if pd.notnull(row.get("nfl")) else None,
                    "apoe4_carrier": bool(row.get("apoe4_carrier", False))
                },
                "imaging_features": {
                    "hippocampal_volume_mm3": float(row["hippocampal_volume_mm3"]) if pd.notnull(row.get("hippocampal_volume_mm3")) else None,
                    "entorhinal_cortical_thickness": float(row["entorhinal_cortical_thickness"]) if pd.notnull(row.get("entorhinal_cortical_thickness")) else None,
                    "ventricle_volume_ratio": float(row["ventricle_volume_ratio"]) if pd.notnull(row.get("ventricle_volume_ratio")) else None,
                    "mri_taken_flag": bool(row.get("mri_taken_flag", False)),
                    "pet_taken_flag": bool(row.get("pet_taken_flag", False))
                }
            }
            create_patient_record(db, p_dict, model=model)
            imported_count += 1
        except Exception as ex:
            errors.append(f"Row {idx+1} (ID: {row.get('patient_id', 'unknown')}): {str(ex)}")

    db.commit()
    return imported_count, errors
