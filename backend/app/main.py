from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.utils.config import settings
from app.database.connection import engine, Base, SessionLocal
from app.services.auth_service import seed_demo_users_if_empty
from app.api import auth, dashboard, patients, prioritization, pathway, analytics, model, audit, demo, notifications

# Create database tables
Base.metadata.create_all(bind=engine)

# Seed standard evaluation demo accounts into SQLite database
db = SessionLocal()
try:
    seed_demo_users_if_empty(db)
finally:
    db.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="NeuroPath AI — AI-Driven Prioritization System for Early Alzheimer's Diagnostic Pathways",
    version="1.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

# Enable CORS for configured frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN, "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication & Security"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(patients.router, prefix="/api/patients", tags=["Patients"])
app.include_router(prioritization.router, prefix="/api/prioritization", tags=["Prioritization"])
app.include_router(pathway.router, prefix="/api/pathway", tags=["Pathway"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(model.router, prefix="/api/model", tags=["Model & Explainability"])
app.include_router(audit.router, prefix="/api/audit-logs", tags=["Audit & Security"])
app.include_router(demo.router, prefix="/api/demo", tags=["Demo Mode"])

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "system": settings.PROJECT_NAME,
        "disclaimer": "Clinical Decision Support Only. Not a Diagnostic Tool.",
        "model_version": settings.MODEL_VERSION
    }
