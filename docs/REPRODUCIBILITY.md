# NeuroPath AI — Reproducibility & Verification Guide

This document provides exact, step-by-step instructions to reproduce environment setup, dataset generation, model training, evaluation, and test execution for **NeuroPath AI**.

---

## 💻 Environment Requirements

- **Operating System**: Windows / Linux / macOS
- **Python Version**: `Python 3.10+` (Tested on Python 3.14)
- **Node.js Version**: `Node.js 18+` and `npm 9+`
- **Primary Dependencies**:
  - `fastapi` 0.110+
  - `scikit-learn` 1.4+
  - `pandas` 2.2+
  - `sqlalchemy` 2.0+
  - `pytest` 8.0+

---

## 🛠️ Step-by-Step Execution Sequence

### Step 1: Install Dependencies
```bash
# Navigate to project directory
cd "Alzheimer’s diagnostic"

# Install backend dependencies
pip install -r backend/requirements.txt

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### Step 2: Generate Deterministic Synthetic Cohort
```bash
python -c "
import os, pandas as pd
from backend.app.services.synthetic_data import generate_synthetic_patients

os.makedirs('data/synthetic', exist_ok=True)
os.makedirs('data/processed', exist_ok=True)

patients = generate_synthetic_patients(248)
print('Generated 248 synthetic patient records with seed=42.')
"
```

### Step 3: Run Full Automated Test Suite
```bash
$env:PYTHONPATH="backend"
python -m pytest backend/tests
```

**Expected Output**: `9 passed` unit tests verifying:
- Patient ID independence (zero hardcoding)
- Feature sensitivity (score changes dynamically on feature edits)
- Dynamic evaluation metrics calculation
- API route status and database CRUD operations
- Diagnostic pathway escalation logic

### Step 4: Verify Frontend Production Build
```bash
cd frontend
npm run build
cd ..
```

**Expected Output**: `vite build` completes cleanly with **0 TypeScript compilation errors**.

### Step 5: Launch Application
```bash
python run.py
```
- Frontend UI: `http://localhost:3000`
- Backend API Docs: `http://127.0.0.1:8000/api/docs`

---

## 🔒 Random Seed Specification

- **Synthetic Generator Seed**: `random.seed(42)` and `np.random.seed(42)` in [`synthetic_data.py`](file:///d:/Alzheimer’s%20diagnostic/backend/app/services/synthetic_data.py#L11-L12).
- **Train/Test Split Seed**: `random_state=42` in [`pipeline.py`](file:///d:/Alzheimer’s%20diagnostic/backend/app/ml/pipeline.py#L113).
- **Classifier Random State**: `random_state=42` in `RandomForestClassifier`, `GradientBoostingClassifier`, and `LogisticRegression`.
