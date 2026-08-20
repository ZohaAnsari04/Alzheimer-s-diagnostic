# NeuroPath AI — Feature Leakage & Feature Vector Audit

This document audits all 16 clinical variables used by the **NeuroPath AI** prioritization model to guarantee zero target leakage, zero future diagnostic outcome contamination, and 100% decision-time feature availability.

---

## 📋 Feature Leakage Audit Table

| # | Feature Name | Internal Key | Data Source | Type | Availability at Decision Time | Target Leakage Risk | Notes |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| 1 | Patient Age | `age` | `Patient` table | Integer | ✅ YES | LOW | Demographic baseline risk indicator. |
| 2 | MMSE Score | `mmse_score` | `CognitiveAssessment` | Float ($0-30$) | ✅ YES | LOW | Standard Mini-Mental State Examination screening score. |
| 3 | MoCA Score | `moca_score` | `CognitiveAssessment` | Float ($0-30$) | ✅ YES | LOW | Montreal Cognitive Assessment screening score. |
| 4 | Cognitive Decline Indicator | `cognitive_decline_indicator` | `CognitiveAssessment` | Boolean | ✅ YES | LOW | Baseline longitudinal cognitive decline observation. |
| 5 | Memory Decline Flag | `memory_decline_flag` | `CognitiveAssessment` | Boolean | ✅ YES | LOW | Patient/informant memory complaint flag. |
| 6 | Executive Function Score | `executive_fn_score` | `CognitiveAssessment` | Float ($0-30$) | ✅ YES | LOW | Baseline executive function test score. |
| 7 | Comorbidities Count | `comorbidities_count` | `ClinicalIndicators` | Integer | ✅ YES | LOW | Total count of baseline chronic medical conditions. |
| 8 | Family History of AD | `family_history_alzheimers` | `ClinicalIndicators` | Boolean | ✅ YES | LOW | First-degree family history indicator. |
| 9 | Plasma $\text{A}\beta_{42/40}$ Ratio | `abeta_42_44_ratio` | `BloodMarkers` | Float ($0-0.2$) | ✅ YES | LOW | Blood-based amyloid biomarker ratio. |
| 10 | Plasma $p\text{-tau}_{181}$ | `ptau_181` | `BloodMarkers` | Float (pg/mL) | ✅ YES | LOW | Blood-based phosphorylated tau biomarker. |
| 11 | Plasma $p\text{-tau}_{217}$ | `ptau_217` | `BloodMarkers` | Float (pg/mL) | ✅ YES | LOW | Blood-based $p\text{-tau}_{217}$ biomarker. |
| 12 | Neurofilament Light Chain | `nfl` | `BloodMarkers` | Float (pg/mL) | ✅ YES | LOW | Axonal neurodegeneration blood biomarker. |
| 13 | ApoE4 Allele Carrier Status | `apoe4_carrier` | `BloodMarkers` | Boolean | ✅ YES | LOW | Genetic susceptibility risk factor. |
| 14 | Hippocampal Volume | `hippocampal_volume_mm3` | `ImagingFeatures` | Float ($\text{mm}^3$) | ✅ YES (MRI stage) | LOW | Structural MRI brain volume measure. |
| 15 | Entorhinal Thickness | `entorhinal_cortical_thickness` | `ImagingFeatures` | Float (mm) | ✅ YES (MRI stage) | LOW | Cortical thickness structural measure. |
| 16 | Ventricle Volume Ratio | `ventricle_volume_ratio` | `ImagingFeatures` | Float | ✅ YES (MRI stage) | LOW | Ventricular enlargement ratio measure. |

---

## 🔒 Target Leakage Verification Checklist

- [x] **No Future Stage Contamination**: Features do NOT contain future diagnostic outcomes, PET scan status, or post-hoc autopsy diagnoses.
- [x] **Decision-Time Availability**: All features represent tests available *at or prior to* the point of clinical prioritization.
- [x] **No Post-Treatment Flags**: Features exclude medication responses or post-interventional clinical outcomes.
