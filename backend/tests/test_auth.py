import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.connection import engine, Base, SessionLocal, get_db
from app.database.models import User
from app.services.auth_service import hash_password, verify_password, create_access_token, seed_demo_users_if_empty

@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_demo_users_if_empty(db)
    db.close()
    yield

client = TestClient(app)

def test_password_hashing():
    plain = "SuperSecretPassword2026!"
    hashed = hash_password(plain)
    assert hashed != plain
    assert hashed.startswith("$2b$") or hashed.startswith("$2a$")
    assert verify_password(plain, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False

def test_login_success():
    response = client.post("/api/auth/login", json={
        "email": "clinician@neuropath.demo",
        "password": "ClinicianPass2026!"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "clinician@neuropath.demo"
    assert data["user"]["role"] == "CLINICIAN"

def test_login_invalid_password():
    response = client.post("/api/auth/login", json={
        "email": "clinician@neuropath.demo",
        "password": "IncorrectPassword123!"
    })
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]

def test_login_unknown_user():
    response = client.post("/api/auth/login", json={
        "email": "nonexistent@neuropath.demo",
        "password": "AnyPassword123!"
    })
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]

def test_me_endpoint():
    login_res = client.post("/api/auth/login", json={
        "email": "admin@neuropath.demo",
        "password": "AdminPass2026!"
    })
    token = login_res.json()["access_token"]

    response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "admin@neuropath.demo"
    assert data["role"] == "ADMIN"

def test_missing_token():
    response = client.get("/api/patients")
    assert response.status_code == 403 or response.status_code == 401

def test_invalid_token():
    response = client.get("/api/patients", headers={"Authorization": "Bearer invalid_tampered_token_xyz"})
    assert response.status_code == 401

def test_role_authorization_clinician_denied_admin():
    # Login as Clinician
    login_res = client.post("/api/auth/login", json={
        "email": "clinician@neuropath.demo",
        "password": "ClinicianPass2026!"
    })
    token = login_res.json()["access_token"]

    # Clinician attempts ADMIN-only route
    response = client.post("/api/model/algorithm?algorithm=logistic_regression", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403
    assert "requires 'ADMIN' privileges" in response.json()["detail"]

def test_admin_access_allowed():
    # Login as Admin
    login_res = client.post("/api/auth/login", json={
        "email": "admin@neuropath.demo",
        "password": "AdminPass2026!"
    })
    token = login_res.json()["access_token"]

    # Admin attempts ADMIN-only route
    response = client.post("/api/model/algorithm?algorithm=logistic_regression", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200

def test_demo_user_seed_is_idempotent():
    db = SessionLocal()
    count_before = db.query(User).count()
    seed_demo_users_if_empty(db)
    count_after = db.query(User).count()
    assert count_before == count_after == 3
    db.close()
