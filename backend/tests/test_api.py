from fastapi.testclient import TestClient
from app.main import app
from app.database.connection import engine, Base, SessionLocal
from app.services.auth_service import seed_demo_users_if_empty

client = TestClient(app)

def get_auth_header():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_demo_users_if_empty(db)
    finally:
        db.close()
    res = client.post("/api/auth/login", json={
        "email": "clinician@neuropath.demo",
        "password": "ClinicianPass2026!"
    })
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "Clinical Decision Support Only" in data["disclaimer"]

def test_dashboard_summary():
    headers = get_auth_header()
    response = client.get("/api/dashboard/summary", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_screened" in data
    assert data["total_screened"] > 0
    assert "high_priority" in data

def test_patient_list():
    headers = get_auth_header()
    response = client.get("/api/patients?page=1&page_size=10", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    assert len(data["patients"]) > 0

def test_patient_detail():
    headers = get_auth_header()
    response = client.get("/api/patients/P-1042", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["patient_id"] == "P-1042"
    assert data["age"] == 72
    assert data["prioritization_result"]["priority_level"] == "HIGH"
