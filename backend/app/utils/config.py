import os

class Settings:
    PROJECT_NAME: str = "NeuroPath AI"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./neuropath.db")

    # Security & JWT Configuration
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "neuropath-ai-secure-dev-secret-key-change-in-production-2026")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "120"))
    FRONTEND_ORIGIN: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")

    # Prototype Prioritization Score Thresholds
    # LOW: 0 - 39, MEDIUM: 40 - 69, HIGH: 70 - 100
    THRESHOLD_LOW_MAX: float = 39.0
    THRESHOLD_MEDIUM_MAX: float = 69.0
    
    # Prototype Diagnostic Resource Capacities (daily)
    DEFAULT_MRI_CAPACITY: int = 15
    DEFAULT_PET_CAPACITY: int = 5
    DEFAULT_BIOMARKER_CAPACITY: int = 40
    
    # Model Version
    MODEL_VERSION: str = "baseline-rf-v1.0"

settings = Settings()
