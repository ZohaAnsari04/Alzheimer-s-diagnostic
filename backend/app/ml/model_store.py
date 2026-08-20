from app.ml.pipeline import PrioritizationMLModel

# Global singleton model instance
ml_model_instance = PrioritizationMLModel()

def get_ml_model() -> PrioritizationMLModel:
    return ml_model_instance
