# NeuroPath AI — ML Data Flow Architecture

This document details the exact, step-by-step data transformation pipeline across **NeuroPath AI** from raw patient ingestion to diagnostic stage recommendations.

---

## 🔄 End-to-End Data Pipeline Diagram

```text
Raw Patient Input (CSV / JSON)
      ↓ [Step 1: Ingestion & Schema Validation]
Data Validation (`parse_and_import_csv` in `patient_service.py`)
      ↓ [Step 2: Relational Persistence]
Database Record (`Patient`, `CognitiveAssessment`, `BloodMarkers`, `ImagingFeatures`)
      ↓ [Step 3: Feature Vector Construction]
Feature Extraction (`extract_features_dataframe` in `pipeline.py`)
      ↓ [Step 4: Imputation & Scaling]
Preprocessing (`SimpleImputer` + `StandardScaler`)
      ↓ [Step 5: Machine Learning Classifier]
Supervised Model (`RandomForestClassifier` / `GradientBoosting` / `LogisticRegression`)
      ↓ [Step 6: Class Probability Output]
Model Output Probability (`predict_proba()[:, 1]`)
      ↓ [Step 7: Prioritization Score Scaling]
Decision-Support Priority Score (`round(prob * 100, 1)`)
      ↓ [Step 8: Risk Stratification]
Priority Tier (`HIGH` > 69, `MEDIUM` 40-69, `LOW` < 40)
      ↓ [Step 9: Model Factor Explainability]
Local Explanation (`_explain_patient` factor point breakdown)
      ↓ [Step 10: Clinical Pathway Engine]
Suggested Next Diagnostic Stage (`recommend_next_stage` in `pathway_engine.py`)
```

---

## 📑 Detailed Transformation Steps

### Step 1: Ingestion & Validation
- **File**: [`backend/app/services/patient_service.py`](file:///d:/Alzheimer’s%20diagnostic/backend/app/services/patient_service.py#L153-L245)
- **Function**: `parse_and_import_csv(csv_content, db)`
- **Input**: Raw CSV byte stream uploaded via POST `/api/patients/upload`
- **Output**: Validated dictionary representation of patient records or error array
- **Transformations**: Checks required columns (`patient_id`, `age`), validates age range ($18 \le \text{age} \le 120$), validates cognitive scores ($0 \le \text{MMSE/MoCA} \le 30$), and verifies duplicate patient IDs.
- **Leakage / Hardcoding Check**: Zero hardcoded IDs. Rejects invalid rows cleanly.

### Step 2: Relational Database Storage
- **File**: [`backend/app/database/models.py`](file:///d:/Alzheimer’s%20diagnostic/backend/app/database/models.py#L6-L95)
- **Function**: `create_patient_record(db, p_dict, model)`
- **Input**: Dictionary of clinical values
- **Output**: SQLAlchemy `Patient` ORM entity with foreign-key child tables (`CognitiveAssessment`, `ClinicalIndicators`, `BloodMarkers`, `ImagingFeatures`)
- **Transformations**: Normalized relational storage indexed by `patient_id`.

### Step 3: Feature Extraction
- **File**: [`backend/app/ml/pipeline.py`](file:///d:/Alzheimer’s%20diagnostic/backend/app/ml/pipeline.py#L57-L86)
- **Function**: `extract_features_dataframe(patients_data)`
- **Input**: List of patient record dictionaries
- **Output**: Pandas `DataFrame` containing 16 numerical feature columns
- **Transformations**: Maps nested JSON objects into a flat 16-column matrix.

### Step 4: Imputation & Scaling
- **File**: [`backend/app/ml/pipeline.py`](file:///d:/Alzheimer’s%20diagnostic/backend/app/ml/pipeline.py#L107-L108)
- **Function**: `imputer.fit_transform()` & `scaler.fit_transform()`
- **Input**: 16-column raw feature matrix
- **Output**: Scaled NumPy matrix ($\mu = 0, \sigma = 1$)
- **Transformations**: Replaces missing values (`NaN`) with column medians (`SimpleImputer(strategy="median")`) and scales variance (`StandardScaler()`).
- **Leakage Protection**: Fitted strictly on training splits during model training.

### Step 5: Machine Learning Classification
- **File**: [`backend/app/ml/pipeline.py`](file:///d:/Alzheimer’s%20diagnostic/backend/app/ml/pipeline.py#L117-L121)
- **Function**: `classifier.fit(X_train, y_train)` & `classifier.predict_proba(X_scaled)`
- **Input**: Preprocessed feature matrix
- **Output**: Binary classification probability vector
- **Models Supported**: `RandomForestClassifier` (100 estimators, max depth 5), `GradientBoostingClassifier`, `LogisticRegression`.

### Step 6: Probability Output
- **File**: [`backend/app/ml/pipeline.py`](file:///d:/Alzheimer’s%20diagnostic/backend/app/ml/pipeline.py#L192-L195)
- **Function**: `predict_proba(X_scaled)[0, 1]`
- **Input**: Scaled patient vector
- **Output**: Continuous value between $0.0$ and $1.0$ representing target class probability.

### Step 7: Decision-Support Priority Score
- **File**: [`backend/app/ml/pipeline.py`](file:///d:/Alzheimer’s%20diagnostic/backend/app/ml/pipeline.py#L197-L198)
- **Function**: `score = round(max(5.0, min(98.0, raw_score)), 1)`
- **Input**: Model output probability
- **Output**: Scaled 0–100 integer/float decision-support priority score.
- **Independence Check**: Verified by `test_patient_id_independence` in `test_ml.py`. Zero patient ID hardcoding.

### Step 8: Risk Stratification
- **File**: [`backend/app/ml/pipeline.py`](file:///d:/Alzheimer’s%20diagnostic/backend/app/ml/pipeline.py#L200-L205)
- **Function**: Threshold categorization
- **Input**: Priority score
- **Output**: Tier string: `HIGH` ($>69.0$), `MEDIUM` ($40.0 - 69.0$), `LOW` ($<40.0$). Thresholds configured in `backend/app/utils/config.py`.

### Step 9: Model Factor Explainability
- **File**: [`backend/app/ml/pipeline.py`](file:///d:/Alzheimer’s%20diagnostic/backend/app/ml/pipeline.py#L217-L311)
- **Function**: `_explain_patient(patient_dict, score)`
- **Input**: Patient dictionary & calculated priority score
- **Output**: JSON breakdown of point contributions across Cognitive Assessment, Age Factor, Blood Biomarkers, Clinical History, MRI Structural Indicators, and Baseline Floor.

### Step 10: Clinical Pathway Engine
- **File**: [`backend/app/services/pathway_engine.py`](file:///d:/Alzheimer’s%20diagnostic/backend/app/services/pathway_engine.py#L3-L40)
- **Function**: `recommend_next_stage(current_stage, priority_level, priority_score)`
- **Input**: `current_stage` string, `priority_level` string, `priority_score` float
- **Output**: Suggested next evaluation stage string (e.g. "Blood-Based Biomarkers", "MRI Evaluation", "PET Scan Prioritization").
