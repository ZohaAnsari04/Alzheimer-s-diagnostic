import random
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any

def generate_synthetic_patients(count: int = 248) -> List[Dict[str, Any]]:
    """
    Generates a deterministic synthetic patient cohort for demonstration purposes.
    All data is artificially generated and does not contain real PII or real patient information.
    """
    random.seed(42)
    np.random.seed(42)

    patients = []

    # Benchmark demo patient: P-1042
    p_1042 = {
        "patient_id": "P-1042",
        "age": 72,
        "sex": "F",
        "current_stage": "Cognitive Screening",
        "review_status": "Pending Review",
        "cognitive_assessment": {
            "mmse_score": 22.0,
            "moca_score": 19.0,
            "cognitive_decline_indicator": True,
            "memory_decline_flag": True,
            "executive_fn_score": 20.0
        },
        "clinical_indicators": {
            "comorbidities_count": 2,
            "hypertension": True,
            "diabetes": True,
            "smoking_history": False,
            "family_history_alzheimers": True
        },
        "blood_markers": {
            "abeta_42_44_ratio": 0.075, # Low ratio indicates amyloid pathology
            "ptau_181": 29.4,          # Elevated
            "ptau_217": 0.48,          # Elevated
            "nfl": 34.5,
            "apoe4_carrier": True
        },
        "imaging_features": {
            "hippocampal_volume_mm3": 2950.0, # Reduced
            "entorhinal_cortical_thickness": 2.35, # Reduced
            "ventricle_volume_ratio": 0.042,
            "mri_completed": False
        }
    }
    patients.append(p_1042)

    # Benchmark second key patient: P-1088
    p_1088 = {
        "patient_id": "P-1088",
        "age": 69,
        "sex": "M",
        "current_stage": "Blood-Based Biomarkers",
        "review_status": "Pending Review",
        "cognitive_assessment": {
            "mmse_score": 24.0,
            "moca_score": 21.0,
            "cognitive_decline_indicator": True,
            "memory_decline_flag": True,
            "executive_fn_score": 22.0
        },
        "clinical_indicators": {
            "comorbidities_count": 1,
            "hypertension": True,
            "diabetes": False,
            "smoking_history": True,
            "family_history_alzheimers": True
        },
        "blood_markers": {
            "abeta_42_44_ratio": 0.068,
            "ptau_181": 31.2,
            "ptau_217": 0.52,
            "nfl": 38.0,
            "apoe4_carrier": True
        },
        "imaging_features": {
            "hippocampal_volume_mm3": 3100.0,
            "entorhinal_cortical_thickness": 2.5,
            "ventricle_volume_ratio": 0.038,
            "mri_completed": False
        }
    }
    patients.append(p_1088)

    # Generate remaining patients P-1001 onwards
    stages = ["Cognitive Screening", "Blood-Based Biomarkers", "MRI Evaluation", "PET Scan Prioritization"]
    # Probabilities for stage distribution to mimic realistic screening pipeline
    stage_weights = [0.55, 0.25, 0.15, 0.05]
    review_statuses = ["Pending Review", "Pending Review", "Under Review", "Completed"]

    start_num = 1001
    created_count = 2

    while created_count < count:
        pid = f"P-{start_num}"
        start_num += 1
        if pid in ["P-1042", "P-1088"]:
            continue

        age = int(np.random.normal(70, 7.5))
        age = max(55, min(92, age))
        sex = random.choice(["M", "F"])

        stage = random.choices(stages, weights=stage_weights)[0]
        status = random.choice(review_statuses)

        # Risk propensity score to keep generated features co-varying realistically
        base_risk = random.random()

        # Cognitive features
        if base_risk > 0.6: # Higher risk cohort
            mmse = round(float(np.random.uniform(18.0, 24.0)), 1)
            moca = round(float(np.random.uniform(15.0, 22.0)), 1)
            cog_decline = True
            mem_decline = random.random() > 0.2
            exec_fn = round(float(np.random.uniform(14.0, 22.0)), 1)
        else: # Lower risk cohort
            mmse = round(float(np.random.uniform(24.0, 30.0)), 1)
            moca = round(float(np.random.uniform(22.0, 30.0)), 1)
            cog_decline = random.random() > 0.85
            mem_decline = random.random() > 0.75
            exec_fn = round(float(np.random.uniform(22.0, 30.0)), 1)

        # Clinical indicators
        comorbidities = random.choices([0, 1, 2, 3], weights=[0.3, 0.4, 0.2, 0.1])[0]
        htn = random.random() > 0.45
        dm = random.random() > 0.7
        smoke = random.random() > 0.75
        fam_history = random.random() > (0.4 if base_risk > 0.5 else 0.8)

        # Blood markers (simulate missingness in early stage patients realistically)
        has_blood_data = (stage != "Cognitive Screening") or (random.random() > 0.4)
        if has_blood_data:
            if base_risk > 0.6:
                abeta_ratio = round(float(np.random.uniform(0.05, 0.085)), 3)
                ptau181 = round(float(np.random.uniform(22.0, 42.0)), 1)
                ptau217 = round(float(np.random.uniform(0.35, 0.75)), 2)
                nfl = round(float(np.random.uniform(28.0, 55.0)), 1)
                apoe4 = random.random() > 0.35
            else:
                abeta_ratio = round(float(np.random.uniform(0.09, 0.14)), 3)
                ptau181 = round(float(np.random.uniform(8.0, 20.0)), 1)
                ptau217 = round(float(np.random.uniform(0.05, 0.28)), 2)
                nfl = round(float(np.random.uniform(12.0, 26.0)), 1)
                apoe4 = random.random() > 0.8
        else:
            abeta_ratio = None
            ptau181 = None
            ptau217 = None
            nfl = None
            apoe4 = False

        # Imaging features (mostly available for MRI / PET stages)
        has_mri_data = (stage in ["MRI Evaluation", "PET Scan Prioritization"]) or (random.random() > 0.7)
        if has_mri_data:
            if base_risk > 0.6:
                hipp_vol = round(float(np.random.uniform(2400.0, 3200.0)), 1)
                entorhinal = round(float(np.random.uniform(1.9, 2.6)), 2)
                ventricle_ratio = round(float(np.random.uniform(0.035, 0.065)), 3)
            else:
                hipp_vol = round(float(np.random.uniform(3300.0, 4300.0)), 1)
                entorhinal = round(float(np.random.uniform(2.7, 3.6)), 2)
                ventricle_ratio = round(float(np.random.uniform(0.018, 0.034)), 3)
            mri_done = True
        else:
            hipp_vol = None
            entorhinal = None
            ventricle_ratio = None
            mri_done = False

        p = {
            "patient_id": pid,
            "age": age,
            "sex": sex,
            "current_stage": stage,
            "review_status": status,
            "cognitive_assessment": {
                "mmse_score": mmse,
                "moca_score": moca,
                "cognitive_decline_indicator": cog_decline,
                "memory_decline_flag": mem_decline,
                "executive_fn_score": exec_fn
            },
            "clinical_indicators": {
                "comorbidities_count": comorbidities,
                "hypertension": htn,
                "diabetes": dm,
                "smoking_history": smoke,
                "family_history_alzheimers": fam_history
            },
            "blood_markers": {
                "abeta_42_44_ratio": abeta_ratio,
                "ptau_181": ptau181,
                "ptau_217": ptau217,
                "nfl": nfl,
                "apoe4_carrier": apoe4
            },
            "imaging_features": {
                "hippocampal_volume_mm3": hipp_vol,
                "entorhinal_cortical_thickness": entorhinal,
                "ventricle_volume_ratio": ventricle_ratio,
                "mri_completed": mri_done
            }
        }
        patients.append(p)
        created_count += 1

    return patients
