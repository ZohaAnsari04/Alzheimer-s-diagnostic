# NeuroPath AI — AI-Driven Prioritization System for Early Alzheimer’s Diagnostic Pathways

**NeuroPath AI** is a production-quality clinical decision-support hackathon prototype designed to help neurologists and clinical teams prioritize screened patient populations for progressive diagnostic evaluation across limited diagnostic resources (blood biomarkers, structural MRI, and PET scans).

---

> [!IMPORTANT]
> **Safety Boundary & Disclaimer**
> - **Clinical Decision Support Only**: This system does NOT diagnose Alzheimer's disease or mild cognitive impairment.
> - **No Treatment Recommendations**: Outputs do NOT recommend medication, clinical therapies, or treatment plans.
> - **Not Clinically Validated**: Outputs support clinician prioritization and must NOT replace professional medical judgment.

---

## 🌟 Key Features

1. **4-Stage Progressive Diagnostic Pathway Engine**:
   - `Cognitive Screening` → `Blood-Based Biomarkers` → `MRI Evaluation` → `PET Scan Prioritization`
2. **Transparent ML Prioritization Score**:
   - Calibrated 0–100 Diagnostic Prioritization Score with factor contribution breakdown (e.g. Cognitive assessment +28, Age factor +18, Biomarkers +16, etc.).
3. **Interactive Clinical Command Center**:
   - Dynamic KPIs, priority distribution charts, and population pipeline funnel visualization.
4. **Searchable & Filterable Patient Queue**:
   - Filter by priority, current stage, recommended next stage, score, and review status.
5. **Patient Intelligence Deep Dive**:
   - Full diagnostic timeline, cognitive scores (MMSE, MoCA), clinical indicators, blood biomarkers (p-tau181, Aβ ratio, ApoE4), and structured MRI features.
6. **Diagnostic Resource Overview & Capacity Planner**:
   - Interactive sliders for MRI, PET, and Biomarker daily capacities to simulate wait times and capacity utilization.
7. **CSV Data Ingestion & Demo Generator**:
   - Drag-and-drop CSV uploader with schema validation, plus a 248-patient synthetic benchmark cohort generator featuring key demo patient `P-1042`.
8. **Audit Logging & Ethics Disclosures**:
   - Security event logs and dedicated ethics/limitations disclosures.

---

## 📊 Data Provenance & Handling Policy

- **Synthetic Demo Data (`data/synthetic/demo_cohort.csv`)**: 248-patient deterministic synthetic dataset (`seed=42`) formatted to match ADNI3 clinical schema. Contains no Protected Health Information (PHI).
- **Public Benchmark Integration (`data/public/README.md`)**: Schema-compatible import architecture supporting open datasets such as **ADNI (LONI)** and **OASIS**.
- **Data Privacy**: No identifiable patient data (PII) is stored or processed. All subjects use de-identified IDs (`P-XXXX`).

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Install Dependencies & Launch (Single Command)
```bash
# Clone repository
cd "Alzheimer’s diagnostic"

# Install backend dependencies
pip install -r backend/requirements.txt

# Install frontend dependencies
cd frontend && npm install && cd ..

# Launch both Backend API & React Frontend simultaneously
python run.py
```

- **Frontend Application**: `http://localhost:3000`
- **Backend Swagger API Docs**: `http://127.0.0.1:8000/api/docs`

---

## 🧪 Running Automated Tests

```bash
# Execute backend test suite (FastAPI endpoints, ML scoring, pathway engine)
$env:PYTHONPATH="backend"
python -m pytest backend/tests
```

---

## 📄 Project Documentation

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — System architecture & database schema
- [MODEL_CARD.md](docs/MODEL_CARD.md) — ML model specification & metrics
- [ETHICS.md](docs/ETHICS.md) — Safety boundaries, bias, and human oversight mandates
- [API.md](docs/API.md) — REST API endpoint specification
- [DEMO_GUIDE.md](docs/DEMO_GUIDE.md) — 3–5 minute judge demo scenario guide
