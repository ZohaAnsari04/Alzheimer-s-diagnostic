# NeuroPath AI — Data Provenance & Dataset Documentation

This directory contains the dataset structure, schema specifications, and data provenance guidelines for **NeuroPath AI** in compliance with the **Precision Care Challenge 2026**.

---

## 📊 Dataset Provenance Summary Table

| Dataset | Type | Used for Training | Used for Evaluation | Target Label | Status |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **Demo Cohort (`data/synthetic/demo_cohort.csv`)** | Synthetic | Yes | Yes (Exploratory) | Synthetic Clinical Progression Index | Demo Active (`seed=42`) |
| **Public ADNI Benchmark (`data/public/README.md`)** | Public | Schema Specs | Schema Specs | ADNI Clinical Diagnostic Target | Ingestion Pipeline Ready |
| **Uploaded Cohort (`/api/patients/upload`)** | User CSV | Yes (On Import) | Yes | Ingested Features | Active Parser |

---

## 📁 Directory Architecture

```
data/
├── synthetic/
│   └── demo_cohort.csv       # Deterministic 248-patient demonstration cohort (seed=42)
├── public/
│   └── README.md             # Instructions & schemas for ADNI / OASIS public dataset integration
├── processed/
│   └── benchmark_cohort.csv  # Standardized benchmark evaluation schema
└── README.md                 # Data provenance & handling policy (this file)
```

---

## 🔒 Data Provenance & Policy

1. **Synthetic Demonstration Data (`data/synthetic/demo_cohort.csv`)**:
   - Artificially generated using numpy distributions aligned with **ADNI3 clinical feature bounds**.
   - Contains **zero Protected Health Information (PHI)** or real patient identity.
   - Used for interactive hackathon demonstrations, reproducible testing, and prototype UI evaluations.

2. **Public Dataset Integration (`data/public/`)**:
   - Supports ADNI (Alzheimer's Disease Neuroimaging Initiative) and OASIS (Open Access Series of Imaging Studies) dataset schemas.
   - Raw ADNI/OASIS data files are **not redistributed** in this repository due to Data Use Agreement (DUA) restrictions.
   - Follow instructions in [`data/public/README.md`](file:///d:/Alzheimer’s%20diagnostic/data/public/README.md) to download and preprocess official ADNI/OASIS releases.

3. **Processed Benchmark Schema (`data/processed/benchmark_cohort.csv`)**:
   - Standardized 24-field tabular format used by the ML preprocessing pipeline (`SimpleImputer` + `StandardScaler`).
