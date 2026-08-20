import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.ml.pipeline import PrioritizationMLModel
from app.services.synthetic_data import generate_synthetic_patients

def train_and_eval():
    patients = generate_synthetic_patients(248)
    model = PrioritizationMLModel()
    model.train(patients)
    return model

if __name__ == "__main__":
    m = train_and_eval()
    print("ML Pipeline execution successful:", m.metrics_cache)
