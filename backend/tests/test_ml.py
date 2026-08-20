import copy
from app.ml.pipeline import PrioritizationMLModel
from app.services.synthetic_data import generate_synthetic_patients

def test_ml_pipeline_training_and_prediction():
    model = PrioritizationMLModel()
    patients = generate_synthetic_patients(50)
    model.train(patients)
    assert model.is_trained is True

    test_p = patients[0]
    score, level, key_factor, contribs = model.predict_patient(test_p)

    assert 0.0 <= score <= 100.0
    assert level in ["HIGH", "MEDIUM", "LOW"]
    assert len(contribs) > 0

def test_patient_id_independence():
    """Verify Patient ID does NOT influence prioritization score or level (No hardcoding)"""
    model = PrioritizationMLModel()
    patients = generate_synthetic_patients(50)
    model.train(patients)

    patient_a = copy.deepcopy(patients[0])
    patient_b = copy.deepcopy(patients[0])

    patient_a["patient_id"] = "P-TEST-999"
    patient_b["patient_id"] = "P-TEST-888"

    score_a, level_a, factor_a, _ = model.predict_patient(patient_a)
    score_b, level_b, factor_b, _ = model.predict_patient(patient_b)

    assert score_a == score_b
    assert level_a == level_b
    assert factor_a == factor_b

def test_feature_sensitivity():
    """Verify changing clinical features dynamically changes model score"""
    model = PrioritizationMLModel()
    patients = generate_synthetic_patients(50)
    model.train(patients)

    low_risk = copy.deepcopy(patients[0])
    low_risk["age"] = 55
    low_risk["cognitive_assessment"]["mmse_score"] = 29.0
    low_risk["cognitive_assessment"]["moca_score"] = 28.0
    low_risk["blood_markers"]["ptau_181"] = 10.0
    low_risk["imaging_features"]["hippocampal_volume_mm3"] = 4200.0

    high_risk = copy.deepcopy(patients[0])
    high_risk["age"] = 82
    high_risk["cognitive_assessment"]["mmse_score"] = 18.0
    high_risk["cognitive_assessment"]["moca_score"] = 16.0
    high_risk["blood_markers"]["ptau_181"] = 45.0
    high_risk["imaging_features"]["hippocampal_volume_mm3"] = 2400.0

    score_low, _, _, _ = model.predict_patient(low_risk)
    score_high, _, _, _ = model.predict_patient(high_risk)

    assert score_high > score_low

def test_dynamic_metrics_calculation():
    """Verify evaluation metrics are dynamically calculated on test split"""
    model = PrioritizationMLModel()
    patients = generate_synthetic_patients(100)
    model.train(patients)

    metrics = model.metrics_cache
    assert "accuracy" in metrics
    assert "roc_auc" in metrics
    assert "precision" in metrics
    assert "recall" in metrics
    assert metrics["training_records"] + metrics["validation_records"] == 100
