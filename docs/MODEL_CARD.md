# Model Card: Baseline Diagnostic Prioritization Classifier

## Model Details
- **Model Type**: Random Forest Classifier (100 estimators, max depth 5, balanced class weighting)
- **Model Version**: `baseline-rf-v1.0`
- **Output**: Calibrated 0–100 Diagnostic Prioritization Score & Risk Category (`HIGH`: >69, `MEDIUM`: 40–69, `LOW`: <40)
- **Clinical Status**: Non-clinically validated prototype decision support

## Features Used
1. `age`
2. `mmse_score`
3. `moca_score`
4. `cognitive_decline_indicator`
5. `memory_decline_flag`
6. `executive_fn_score`
7. `comorbidities_count`
8. `family_history_alzheimers`
9. `abeta_42_44_ratio`
10. `ptau_181`
11. `ptau_217`
12. `nfl`
13. `apoe4_carrier`
14. `hippocampal_volume_mm3`
15. `entorhinal_cortical_thickness`
16. `ventricle_volume_ratio`

## Explainability
Per-patient feature contribution points are computed proportionately based on model feature weights and raw metric deviations from normative screening thresholds.
