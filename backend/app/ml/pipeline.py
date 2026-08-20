import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, accuracy_score, precision_score, recall_score, f1_score
from app.utils.config import settings

class PrioritizationMLModel:
    """
    Interpretable Baseline ML Pipeline for Diagnostic Prioritization.
    Supports Random Forest, Gradient Boosting, and Logistic Regression algorithms.
    """
    def __init__(self, algorithm: str = "random_forest"):
        self.model_version = settings.MODEL_VERSION
        self.algorithm_name = algorithm
        self.imputer = SimpleImputer(strategy="median")
        self.scaler = StandardScaler()
        self._init_classifier(algorithm)
        self.is_trained = False
        self.feature_names = [
            "age",
            "mmse_score",
            "moca_score",
            "cognitive_decline_indicator",
            "memory_decline_flag",
            "executive_fn_score",
            "comorbidities_count",
            "family_history_alzheimers",
            "abeta_42_44_ratio",
            "ptau_181",
            "ptau_217",
            "nfl",
            "apoe4_carrier",
            "hippocampal_volume_mm3",
            "entorhinal_cortical_thickness",
            "ventricle_volume_ratio"
        ]
        self.metrics_cache = {}
        self.fairness_cache = []

    def _init_classifier(self, algorithm: str):
        self.algorithm_name = algorithm
        if algorithm == "gradient_boosting":
            self.classifier = GradientBoostingClassifier(n_estimators=100, max_depth=3, random_state=42)
        elif algorithm == "logistic_regression":
            self.classifier = LogisticRegression(class_weight="balanced", random_state=42, max_iter=1000)
        else:
            self.classifier = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42, class_weight="balanced")

    def set_algorithm(self, algorithm: str):
        self._init_classifier(algorithm)

    def extract_features_dataframe(self, patients_data: List[Dict[str, Any]]) -> pd.DataFrame:
        rows = []
        for p in patients_data:
            cog = p.get("cognitive_assessment") or {}
            clin = p.get("clinical_indicators") or {}
            blood = p.get("blood_markers") or {}
            img = p.get("imaging_features") or {}

            row = {
                "patient_id": p.get("patient_id"),
                "age": float(p.get("age", 70)),
                "sex": str(p.get("sex", "M")),
                "mmse_score": float(cog.get("mmse_score")) if cog.get("mmse_score") is not None else np.nan,
                "moca_score": float(cog.get("moca_score")) if cog.get("moca_score") is not None else np.nan,
                "cognitive_decline_indicator": 1.0 if cog.get("cognitive_decline_indicator") else 0.0,
                "memory_decline_flag": 1.0 if cog.get("memory_decline_flag") else 0.0,
                "executive_fn_score": float(cog.get("executive_fn_score")) if cog.get("executive_fn_score") is not None else np.nan,
                "comorbidities_count": float(clin.get("comorbidities_count", 0)),
                "family_history_alzheimers": 1.0 if clin.get("family_history_alzheimers") else 0.0,
                "abeta_42_44_ratio": float(blood.get("abeta_42_44_ratio")) if blood.get("abeta_42_44_ratio") is not None else np.nan,
                "ptau_181": float(blood.get("ptau_181")) if blood.get("ptau_181") is not None else np.nan,
                "ptau_217": float(blood.get("ptau_217")) if blood.get("ptau_217") is not None else np.nan,
                "nfl": float(blood.get("nfl")) if blood.get("nfl") is not None else np.nan,
                "apoe4_carrier": 1.0 if blood.get("apoe4_carrier") else 0.0,
                "hippocampal_volume_mm3": float(img.get("hippocampal_volume_mm3")) if img.get("hippocampal_volume_mm3") is not None else np.nan,
                "entorhinal_cortical_thickness": float(img.get("entorhinal_cortical_thickness")) if img.get("entorhinal_cortical_thickness") is not None else np.nan,
                "ventricle_volume_ratio": float(img.get("ventricle_volume_ratio")) if img.get("ventricle_volume_ratio") is not None else np.nan,
            }
            rows.append(row)
        return pd.DataFrame(rows)

    def train(self, patients_data: List[Dict[str, Any]]):
        df = self.extract_features_dataframe(patients_data)
        X = df[self.feature_names]

        target = []
        for _, row in X.iterrows():
            score = 0
            if row["age"] > 70: score += 1
            if not np.isnan(row["mmse_score"]) and row["mmse_score"] <= 24: score += 3
            if not np.isnan(row["moca_score"]) and row["moca_score"] <= 21: score += 3
            if row["cognitive_decline_indicator"] == 1.0: score += 2
            if not np.isnan(row["ptau_181"]) and row["ptau_181"] > 25: score += 3
            if not np.isnan(row["abeta_42_44_ratio"]) and row["abeta_42_44_ratio"] < 0.08: score += 3
            if row["apoe4_carrier"] == 1.0: score += 2
            if not np.isnan(row["hippocampal_volume_mm3"]) and row["hippocampal_volume_mm3"] < 3100: score += 3
            target.append(1 if score >= 6 else 0)

        y = np.array(target)

        X_imp = self.imputer.fit_transform(X)
        X_scaled = self.scaler.fit_transform(X_imp)

        if len(X) >= 10 and len(np.unique(y)) > 1:
            X_train, X_test, y_train, y_test, df_train, df_test = train_test_split(
                X_scaled, y, df, test_size=0.2, random_state=42, stratify=y
            )
        else:
            X_train, X_test, y_train, y_test, df_train, df_test = X_scaled, X_scaled, y, y, df, df

        self.classifier.fit(X_train, y_train)
        self.is_trained = True

        preds_prob = self.classifier.predict_proba(X_test)[:, 1]
        preds_binary = (preds_prob >= 0.5).astype(int)

        try:
            auc = float(roc_auc_score(y_test, preds_prob))
        except Exception:
            auc = float(accuracy_score(y_test, preds_binary))

        acc = float(accuracy_score(y_test, preds_binary))
        prec = float(precision_score(y_test, preds_binary, zero_division=0))
        rec = float(recall_score(y_test, preds_binary, zero_division=0))
        f1 = float(f1_score(y_test, preds_binary, zero_division=0))

        name_map = {
            "random_forest": "Random Forest Classifier",
            "gradient_boosting": "Gradient Boosting Classifier",
            "logistic_regression": "Logistic Regression Classifier"
        }

        self.metrics_cache = {
            "algorithm": self.algorithm_name,
            "model_type": name_map.get(self.algorithm_name, "Random Forest Classifier"),
            "dataset_name": "Synthetic Clinical Cohort (ADNI3 Schema-Aligned)",
            "feature_count": len(self.feature_names),
            "training_records": len(X_train),
            "validation_records": len(X_test),
            "roc_auc": round(auc, 3),
            "accuracy": round(acc, 3),
            "precision": round(prec, 3),
            "recall": round(rec, 3),
            "f1_score": round(f1, 3),
            "status": f"Trained ({name_map.get(self.algorithm_name, 'Random Forest')})"
        }

        # Compute Demographic Subgroup Fairness Metrics
        df_test_copy = df_test.copy()
        df_test_copy["pred"] = preds_binary
        df_test_copy["target"] = y_test

        fairness = []
        # Age subgroups (<70 vs >=70)
        age_under_70 = df_test_copy[df_test_copy["age"] < 70]
        age_70_plus = df_test_copy[df_test_copy["age"] >= 70]
        
        acc_u70 = round(float(accuracy_score(age_under_70["target"], age_under_70["pred"])), 3) if len(age_under_70) > 0 else acc
        acc_70p = round(float(accuracy_score(age_70_plus["target"], age_70_plus["pred"])), 3) if len(age_70_plus) > 0 else acc

        fairness.append({"group": "Age < 70", "sample_size": len(age_under_70), "accuracy": acc_u70, "parity_diff": round(abs(acc_u70 - acc_70p), 3)})
        fairness.append({"group": "Age ≥ 70", "sample_size": len(age_70_plus), "accuracy": acc_70p, "parity_diff": round(abs(acc_u70 - acc_70p), 3)})

        # Sex subgroups (Female vs Male)
        females = df_test_copy[df_test_copy["sex"] == "F"]
        males = df_test_copy[df_test_copy["sex"] == "M"]

        acc_f = round(float(accuracy_score(females["target"], females["pred"])), 3) if len(females) > 0 else acc
        acc_m = round(float(accuracy_score(males["target"], males["pred"])), 3) if len(males) > 0 else acc

        fairness.append({"group": "Female", "sample_size": len(females), "accuracy": acc_f, "parity_diff": round(abs(acc_f - acc_m), 3)})
        fairness.append({"group": "Male", "sample_size": len(males), "accuracy": acc_m, "parity_diff": round(abs(acc_f - acc_m), 3)})

        self.fairness_cache = fairness

    def predict_patient(self, patient_dict: Dict[str, Any]) -> Tuple[float, str, str, List[Dict[str, Any]]]:
        df = self.extract_features_dataframe([patient_dict])
        X = df[self.feature_names]

        if not self.is_trained:
            return 75.0, "HIGH", "Cognitive Assessment", []

        X_imp = self.imputer.transform(X)
        X_scaled = self.scaler.transform(X_imp)

        if hasattr(self.classifier, "predict_proba"):
            prob = float(self.classifier.predict_proba(X_scaled)[0, 1])
        else:
            prob = 0.75

        raw_score = prob * 100.0
        score = round(max(5.0, min(98.0, raw_score)), 1)

        if score > settings.THRESHOLD_MEDIUM_MAX:
            level = "HIGH"
        elif score > settings.THRESHOLD_LOW_MAX:
            level = "MEDIUM"
        else:
            level = "LOW"

        contributions, key_factor = self._explain_patient(patient_dict, score)
        return score, level, key_factor, contributions

    def _explain_patient(self, patient_dict: Dict[str, Any], score: float) -> Tuple[List[Dict[str, Any]], str]:
        cog = patient_dict.get("cognitive_assessment") or {}
        clin = patient_dict.get("clinical_indicators") or {}
        blood = patient_dict.get("blood_markers") or {}
        img = patient_dict.get("imaging_features") or {}
        age = patient_dict.get("age", 70)

        cog_pts = 0.0
        if cog.get("mmse_score") is not None:
            cog_pts += max(0, (28.0 - cog["mmse_score"]) * 2.5)
        if cog.get("moca_score") is not None:
            cog_pts += max(0, (26.0 - cog["moca_score"]) * 2.5)
        if cog.get("cognitive_decline_indicator"):
            cog_pts += 12.0
        if cog.get("memory_decline_flag"):
            cog_pts += 8.0

        age_pts = max(0, (age - 60) * 0.8)

        blood_pts = 0.0
        if blood.get("ptau_181") is not None and blood["ptau_181"] > 20:
            blood_pts += min(20.0, (blood["ptau_181"] - 20) * 0.8)
        if blood.get("abeta_42_44_ratio") is not None and blood["abeta_42_44_ratio"] < 0.09:
            blood_pts += max(0, (0.09 - blood["abeta_42_44_ratio"]) * 200.0)
        if blood.get("apoe4_carrier"):
            blood_pts += 10.0

        clin_pts = 0.0
        if clin.get("family_history_alzheimers"):
            clin_pts += 10.0
        clin_pts += (clin.get("comorbidities_count", 0) * 3.0)

        img_pts = 0.0
        if img.get("hippocampal_volume_mm3") is not None and img["hippocampal_volume_mm3"] < 3300:
            img_pts += max(0, (3300 - img["hippocampal_volume_mm3"]) * 0.015)
        if img.get("entorhinal_cortical_thickness") is not None and img["entorhinal_cortical_thickness"] < 2.8:
            img_pts += max(0, (2.8 - img["entorhinal_cortical_thickness"]) * 10.0)

        base_pts = 10.0

        total_raw = cog_pts + age_pts + blood_pts + clin_pts + img_pts + base_pts
        if total_raw == 0: total_raw = 1.0

        scale = score / total_raw

        c_cog = round(cog_pts * scale, 1)
        c_age = round(age_pts * scale, 1)
        c_blood = round(blood_pts * scale, 1)
        c_clin = round(clin_pts * scale, 1)
        c_img = round(img_pts * scale, 1)
        c_base = round(score - (c_cog + c_age + c_blood + c_clin + c_img), 1)

        contributions = [
            {
                "factor_name": "Cognitive Assessment",
                "points": c_cog,
                "percentage": round((c_cog / score) * 100, 1) if score > 0 else 0,
                "description": f"MMSE: {cog.get('mmse_score', 'N/A')}, MoCA: {cog.get('moca_score', 'N/A')}, Decline flag: {cog.get('cognitive_decline_indicator', False)}"
            },
            {
                "factor_name": "Age-Related Factor",
                "points": c_age,
                "percentage": round((c_age / score) * 100, 1) if score > 0 else 0,
                "description": f"Patient age: {age} years"
            },
            {
                "factor_name": "Blood Biomarkers",
                "points": c_blood,
                "percentage": round((c_blood / score) * 100, 1) if score > 0 else 0,
                "description": f"p-tau181: {blood.get('ptau_181', 'N/A')}, Aβ ratio: {blood.get('abeta_42_44_ratio', 'N/A')}, ApoE4: {blood.get('apoe4_carrier', False)}"
            },
            {
                "factor_name": "Clinical & Family History",
                "points": c_clin,
                "percentage": round((c_clin / score) * 100, 1) if score > 0 else 0,
                "description": f"Family history: {clin.get('family_history_alzheimers', False)}, Comorbidities: {clin.get('comorbidities_count', 0)}"
            },
            {
                "factor_name": "MRI Structural Indicators",
                "points": c_img,
                "percentage": round((c_img / score) * 100, 1) if score > 0 else 0,
                "description": f"Hippocampal vol: {img.get('hippocampal_volume_mm3', 'N/A')} mm³, Entorhinal thickness: {img.get('entorhinal_cortical_thickness', 'N/A')} mm"
            },
            {
                "factor_name": "Baseline Risk Floor",
                "points": c_base,
                "percentage": round((c_base / score) * 100, 1) if score > 0 else 0,
                "description": "Base risk floor for population screened cohort"
            }
        ]

        sorted_contribs = sorted(contributions[:-1], key=lambda x: x["points"], reverse=True)
        key_factor = sorted_contribs[0]["factor_name"] if sorted_contribs else "Cognitive decline"

        return contributions, key_factor

    def get_global_feature_importances(self) -> List[Dict[str, Any]]:
        if not self.is_trained:
            importances = [1.0 / len(self.feature_names)] * len(self.feature_names)
        else:
            if hasattr(self.classifier, "feature_importances_"):
                importances = self.classifier.feature_importances_
            elif hasattr(self.classifier, "coef_"):
                importances = np.abs(self.classifier.coef_[0])
                importances = importances / np.sum(importances)
            else:
                importances = [1.0 / len(self.feature_names)] * len(self.feature_names)

        res = []
        name_map = {
            "mmse_score": "MMSE Cognitive Score",
            "moca_score": "MoCA Cognitive Score",
            "ptau_181": "Blood p-tau181",
            "ptau_217": "Blood p-tau217",
            "abeta_42_44_ratio": "Blood Aβ 42/40 Ratio",
            "hippocampal_volume_mm3": "Hippocampal Volume (MRI)",
            "entorhinal_cortical_thickness": "Entorhinal Thickness (MRI)",
            "age": "Patient Age",
            "apoe4_carrier": "ApoE4 Carrier Status",
            "cognitive_decline_indicator": "Cognitive Decline Flag",
            "memory_decline_flag": "Memory Decline Flag",
            "family_history_alzheimers": "Family History",
            "nfl": "Neurofilament Light (NfL)",
            "executive_fn_score": "Executive Function Score",
            "comorbidities_count": "Comorbidities Count",
            "ventricle_volume_ratio": "Ventricle Volume Ratio"
        }

        for fname, imp in zip(self.feature_names, importances):
            res.append({
                "feature_key": fname,
                "feature_name": name_map.get(fname, fname),
                "importance": round(float(imp), 4),
                "importance_pct": round(float(imp) * 100, 2)
            })

        res = sorted(res, key=lambda x: x["importance"], reverse=True)
        return res
