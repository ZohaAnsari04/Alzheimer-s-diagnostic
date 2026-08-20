# Public Dataset Integration Guide — ADNI & OASIS

## 1. Overview
NeuroPath AI is designed to ingest multimodal clinical datasets from public repositories such as:
- **ADNI (Alzheimer's Disease Neuroimaging Initiative)**: [https://adni.loni.usc.edu](https://adni.loni.usc.edu)
- **OASIS (Open Access Series of Imaging Studies)**: [https://www.oasis-brains.org](https://www.oasis-brains.org)

Due to LONI / ADNI Data Use Agreements, raw patient datasets cannot be redistributed directly inside open source code repositories.

---

## 2. Ingestion Schema Specification

To map a public ADNI or OASIS export into NeuroPath AI, ensure the CSV contains the following standard headers:

| Field Name | Type | Range / Format | Description |
| :--- | :--- | :--- | :--- |
| `patient_id` | String | `P-XXXX` | De-identified subject identifier |
| `age` | Integer | $18 - 120$ | Patient age in years |
| `sex` | String | `M` / `F` | Gender |
| `current_stage` | String | Screening Stage | Current clinical pathway stage |
| `mmse_score` | Float | $0.0 - 30.0$ | Mini-Mental State Examination score |
| `moca_score` | Float | $0.0 - 30.0$ | Montreal Cognitive Assessment score |
| `cognitive_decline_indicator` | Boolean | `True` / `False` | Longitudinal cognitive decline flag |
| `memory_decline_flag` | Boolean | `True` / `False` | Memory-specific complaint flag |
| `executive_fn_score` | Float | $0.0 - 30.0$ | Executive function score |
| `comorbidities_count` | Integer | $\ge 0$ | Total count of chronic comorbidities |
| `family_history_alzheimers` | Boolean | `True` / `False` | Family history of AD |
| `abeta_42_44_ratio` | Float | $0.0 - 0.20$ | Plasma / CSF $\text{A}\beta_{42/40}$ ratio |
| `ptau_181` | Float | $0.0 - 100.0$ | Plasma $p\text{-tau}_{181}$ (pg/mL) |
| `ptau_217` | Float | $0.0 - 2.0$ | Plasma $p\text{-tau}_{217}$ (pg/mL) |
| `nfl` | Float | $0.0 - 100.0$ | Neurofilament light chain (pg/mL) |
| `apoe4_carrier` | Boolean | `True` / `False` | ApoE $\epsilon4$ allele presence |
| `hippocampal_volume_mm3` | Float | $1000 - 6000$ | Structural MRI hippocampal volume ($\text{mm}^3$) |
| `entorhinal_cortical_thickness` | Float | $1.0 - 5.0$ | Entorhinal cortical thickness (mm) |
| `ventricle_volume_ratio` | Float | $0.0 - 0.15$ | Ventricle to brain volume ratio |

---

## 3. Ingestion Procedure
1. Place your preprocessed public CSV into `data/public/adni_processed.csv`.
2. Navigate to **Data Management** in the NeuroPath AI web application.
3. Click **Import CSV Cohort** and upload `data/public/adni_processed.csv`.
4. The system will automatically validate headers, verify numerical ranges, impute missing values, and run the ML prioritization pipeline.
