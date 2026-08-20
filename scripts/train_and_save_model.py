import sys
import os
import json

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.services.synthetic_data import generate_synthetic_patients
from app.ml.pipeline import PrioritizationMLModel

def main():
    print("Training NeuroPath AI baseline prioritization classifier...")
    patients = generate_synthetic_patients(248)
    
    model = PrioritizationMLModel()
    model.train(patients)

    print("Model Training Metrics:")
    for k, v in model.metrics_cache.items():
        print(f"  {k}: {v}")

    models_dir = os.path.join(os.path.dirname(__file__), "..", "models")
    os.makedirs(models_dir, exist_ok=True)
    
    metadata_path = os.path.join(models_dir, "baseline_model_metadata.json")
    with open(metadata_path, "w") as f:
        json.dump({
            "metrics": model.metrics_cache,
            "feature_importances": model.get_global_feature_importances()
        }, f, indent=2)

    print(f"Saved model metadata to {metadata_path}")

if __name__ == "__main__":
    main()
