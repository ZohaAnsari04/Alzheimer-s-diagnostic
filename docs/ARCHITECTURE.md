# Architecture Specification: NeuroPath AI

## Overview
NeuroPath AI uses a clean decoupled architecture featuring a Python FastAPI backend and a React/TypeScript frontend built with Vite and Tailwind CSS.

```
frontend/ (React + TypeScript + Tailwind)
  ├── src/components/ (CommandCenter, PriorityQueue, PatientIntelligence, etc.)
  └── src/services/apiClient.ts
          │
          ▼  HTTP REST (JSON)
backend/ (FastAPI + Pydantic + SQLAlchemy)
  ├── app/api/ (dashboard, patients, prioritization, pathway, analytics, model, audit)
  ├── app/ml/ (RandomForest pipeline & explainability module)
  └── app/database/ (SQLite / PostgreSQL ORM models)
```

## Unified Patient Database Schema
- **`patients`**: `patient_id`, `age`, `sex`, `current_stage`, `review_status`, `created_at`, `updated_at`
- **`cognitive_assessments`**: `mmse_score`, `moca_score`, `cognitive_decline_indicator`, `memory_decline_flag`, `executive_fn_score`
- **`clinical_indicators`**: `comorbidities_count`, `hypertension`, `diabetes`, `smoking_history`, `family_history_alzheimers`
- **`blood_markers`**: `abeta_42_44_ratio`, `ptau_181`, `ptau_217`, `nfl`, `apoe4_carrier`
- **`imaging_features`**: `hippocampal_volume_mm3`, `entorhinal_cortical_thickness`, `ventricle_volume_ratio`, `mri_completed`
- **`prioritization_results`**: `priority_score`, `priority_level`, `key_contributing_factor`, `recommended_next_stage`, `model_version`, `factor_contributions_json`
- **`audit_logs`**: `timestamp`, `user`, `action`, `resource`, `status`, `details`
