# MODEL CARD — NeuroPath AI Prioritization Engine

## 1. Model Name
**NeuroPath AI Prioritization Engine** (`baseline-rf-v1.0`)

---

## 2. Intended Use
- **Primary Purpose**: Clinical decision-support prototype designed to help neurologists and clinical operations managers prioritize screened patient populations for progressive diagnostic evaluation across limited MRI, PET, and specialist resources.
- **Target Audience**: Licensed neurologists, clinical coordinators, and medical trial evaluators.

---

## 3. Non-Intended Use
- **NOT** a diagnostic tool for Alzheimer's disease or dementia.
- **NOT** intended to issue standalone medical diagnoses or disease probabilities without physician oversight.
- **NOT** intended to prescribe, recommend, or modify pharmaceutical treatment regimens.
- **NOT** authorized for autonomous clinical decision-making.

---

## 4. Training Data & Provenance
- **Dataset Name**: `Synthetic Clinical Cohort (ADNI3 Schema-Aligned)`
- **Data Source**: Artificially generated deterministic patient cohort (`seed=42`, $N=248$ patients) mirroring ADNI3 clinical feature distributions and ranges.
- **Dataset File**: `data/synthetic/demo_cohort.csv`
- **Privacy & Security**: De-identified patient IDs (`P-1001` to `P-1248`). Zero Protected Health Information (PHI).

---

## 5. Target Definition
- **Supervised Target**: Synthetic Clinical Progression Risk Index ($y \in \{0, 1\}$).
- **Target Description**: Composite risk indicator derived from multi-domain clinical risk thresholds (cognitive score impairment MMSE $\le 24$ / MoCA $\le 21$, elevated $p\text{-tau}_{181} > 25\,\text{pg/mL}$, low $\text{A}\beta_{42/40} < 0.08$ ratio, ApoE4 allele carrier status, and hippocampal structural volume $< 3100\,\text{mm}^3$).
- **Scientific Caveat**: The target is a synthetic demonstration index for decision-support prototype evaluation and does NOT represent prospective 5-year longitudinal clinical trial outcomes.

---

## 6. Features Vector (16 Clinical Variables)
1. `age`: Patient age ($55 - 92$ years)
2. `mmse_score`: Mini-Mental State Examination ($0 - 30$)
3. `moca_score`: Montreal Cognitive Assessment ($0 - 30$)
4. `cognitive_decline_indicator`: Longitudinal decline flag
5. `memory_decline_flag`: Subjective memory complaint flag
6. `executive_fn_score`: Executive function score ($0 - 30$)
7. `comorbidities_count`: Chronic comorbidity count
8. `family_history_alzheimers`: Family history of AD
9. `abeta_42_44_ratio`: Plasma $\text{A}\beta_{42/40}$ ratio
10. `ptau_181`: Plasma $p\text{-tau}_{181}$ (pg/mL)
11. `ptau_217`: Plasma $p\text{-tau}_{217}$ (pg/mL)
12. `nfl`: Neurofilament light chain (pg/mL)
13. `apoe4_carrier`: ApoE $\epsilon4$ allele carrier status
14. `hippocampal_volume_mm3`: Structural MRI volume ($\text{mm}^3$)
15. `entorhinal_cortical_thickness`: Entorhinal thickness (mm)
16. `ventricle_volume_ratio`: Ventricle-to-brain volume ratio

---

## 7. Preprocessing Pipeline
- **Missing Value Imputation**: `SimpleImputer(strategy="median")`
- **Feature Scaling**: `StandardScaler()` ($\mu = 0, \sigma = 1$)
- **Data Splitting**: 80% Training ($N=198$) / 20% Held-Out Validation ($N=50$) (`train_test_split`, `stratify=y`, `random_state=42`)
- **Leakage Protection**: Imputer and scaler are fitted strictly on the training partition during model training.

---

## 8. Machine Learning Algorithms Supported
- **Random Forest Classifier** (Default): 100 estimators, max depth 5, balanced class weights, `random_state=42`.
- **Gradient Boosting Classifier**: 100 estimators, max depth 3, `random_state=42`.
- **Logistic Regression Classifier**: L2 regularization, balanced class weights, `max_iter=1000`.

---

## 9. Model Evaluation Metrics
Evaluated dynamically on the 20% held-out test split:
- **ROC-AUC**: Calculated dynamically (`roc_auc_score`)
- **Accuracy**: Calculated dynamically (`accuracy_score`)
- **Precision & Recall**: Zero-division safe multi-class evaluation
- **F1-Score**: Harmonic mean of precision and recall

---

## 10. Probability vs. Decision-Support Priority Score
- **Model Output Probability**: Continuous classifier output probability (`predict_proba()[:, 1]`).
- **Priority Score Transformation**: $\text{Priority Score} = \text{round}(\text{max}(5.0, \text{min}(98.0, \text{probability} \times 100)), 1)$.
- **Calibration Disclaimer**: *Model output probability is a decision-support prioritization score and has not been clinically calibrated on prospective patient populations.*

---

## 11. Explainability & Transparency
- **Global Feature Importance**: Gini feature importances (`feature_importances_`) ranking key clinical predictors.
- **Local Patient Reasoning**: Normalized domain factor point breakdowns (Cognitive Assessment, Age Factor, Blood Biomarkers, Clinical History, MRI Structural Indicators) matching model score outputs.

---

## 12. Demographic Fairness Diagnostics
- Evaluated across demographic subgroups:
  - **Age Subgroups**: Age $<70$ vs Age $\ge 70$
  - **Sex Subgroups**: Female vs Male
- Reports selection rates, accuracy, and absolute parity differences (`parity_diff`).

---

## 13. Limitations & Caveats
1. **Synthetic Demonstration Data**: Model is trained on synthetic demonstration data; prospective multi-site clinical trial validation is required before real clinical deployment.
2. **Prototype Thresholds**: High ($>69$), Medium ($40-69$), and Low ($<40$) priority thresholds are prototype bounds and are not FDA-cleared or clinically validated.
3. **Missing Biomarker Imputation**: Early screening stage patients may lack blood or imaging biomarkers; values are median-imputed by `SimpleImputer`.
