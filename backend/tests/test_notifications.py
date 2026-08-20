from fastapi.testclient import TestClient
from app.main import app
from app.database.connection import engine, Base, SessionLocal
from app.services.auth_service import seed_demo_users_if_empty
from app.services import notification_service
from app.database.models import User

client = TestClient(app)

def setup_module(module):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_demo_users_if_empty(db)
    finally:
        db.close()

def get_auth_header(email="clinician@neuropath.demo", password="ClinicianPass2026!"):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_demo_users_if_empty(db)
    finally:
        db.close()
    res = client.post("/api/auth/login", json={"email": email, "password": password})
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_notification_creation():
    db = SessionLocal()
    try:
        seed_demo_users_if_empty(db)
        user = db.query(User).filter(User.email == "clinician@neuropath.demo").first()
        notif = notification_service.create_notification(
            db=db,
            user_id=user.id,
            type="HIGH_PRIORITY_PATIENT",
            severity="WARNING",
            title="Test High Priority",
            message="Test message",
            patient_id="P-9999",
            route="/patients/P-9999",
            event_key="TEST_EVENT_9999"
        )
        assert notif is not None
        assert notif.title == "Test High Priority"
        assert notif.is_read is False
    finally:
        db.close()

def test_duplicate_notification_prevention():
    db = SessionLocal()
    try:
        seed_demo_users_if_empty(db)
        user = db.query(User).filter(User.email == "clinician@neuropath.demo").first()
        key = "DEDUP_UNIQUE_EVENT_123"
        n1 = notification_service.create_notification(
            db=db, user_id=user.id, type="MRI_CAPACITY", severity="WARNING",
            title="DEDUP 1", message="M1", event_key=key
        )
        n2 = notification_service.create_notification(
            db=db, user_id=user.id, type="MRI_CAPACITY", severity="WARNING",
            title="DEDUP 2", message="M2", event_key=key
        )
        assert n1.id == n2.id
    finally:
        db.close()

def test_user_only_sees_own_notifications():
    headers_clinician = get_auth_header("clinician@neuropath.demo", "ClinicianPass2026!")
    headers_admin = get_auth_header("admin@neuropath.demo", "AdminPass2026!")

    db = SessionLocal()
    try:
        c_user = db.query(User).filter(User.email == "clinician@neuropath.demo").first()
        a_user = db.query(User).filter(User.email == "admin@neuropath.demo").first()

        notification_service.create_notification(db, c_user.id, "PET_QUEUE", "WARNING", "Clinician Only", "C Msg")
        notification_service.create_notification(db, a_user.id, "SECURITY_AUDIT", "WARNING", "Admin Only", "A Msg")
    finally:
        db.close()

    res_c = client.get("/api/notifications", headers=headers_clinician)
    assert res_c.status_code == 200
    c_titles = [n["title"] for n in res_c.json()]
    assert "Clinician Only" in c_titles
    assert "Admin Only" not in c_titles

    res_a = client.get("/api/notifications", headers=headers_admin)
    assert res_a.status_code == 200
    a_titles = [n["title"] for n in res_a.json()]
    assert "Admin Only" in a_titles
    assert "Clinician Only" not in a_titles

def test_unread_count():
    headers = get_auth_header("clinician@neuropath.demo", "ClinicianPass2026!")
    res = client.get("/api/notifications/unread-count", headers=headers)
    assert res.status_code == 200
    assert "count" in res.json()
    assert res.json()["count"] >= 0

def test_mark_notification_read():
    headers = get_auth_header("clinician@neuropath.demo", "ClinicianPass2026!")
    res_list = client.get("/api/notifications", headers=headers)
    notifs = res_list.json()
    if notifs:
        target_id = notifs[0]["id"]
        res_read = client.patch(f"/api/notifications/{target_id}/read", headers=headers)
        assert res_read.status_code == 200
        assert res_read.json()["is_read"] is True

def test_mark_all_read():
    headers = get_auth_header("clinician@neuropath.demo", "ClinicianPass2026!")
    res = client.patch("/api/notifications/read-all", headers=headers)
    assert res.status_code == 200
    assert res.json()["status"] == "success"

    res_count = client.get("/api/notifications/unread-count", headers=headers)
    assert res_count.json()["count"] == 0

def test_cannot_mark_other_users_notification():
    headers_clinician = get_auth_header("clinician@neuropath.demo", "ClinicianPass2026!")
    db = SessionLocal()
    try:
        a_user = db.query(User).filter(User.email == "admin@neuropath.demo").first()
        admin_notif = notification_service.create_notification(
            db, a_user.id, "SECURITY_AUDIT", "WARNING", "Admin Private Notif", "Private"
        )
        admin_notif_id = admin_notif.id
    finally:
        db.close()

    res = client.patch(f"/api/notifications/{admin_notif_id}/read", headers=headers_clinician)
    assert res.status_code == 404

def test_high_priority_notification_generation():
    headers = get_auth_header("clinician@neuropath.demo", "ClinicianPass2026!")
    db = SessionLocal()
    try:
        notification_service.notify_high_priority_patient(db, "P-8888", 89.5, "MEDIUM")
    finally:
        db.close()

    res = client.get("/api/notifications", headers=headers)
    titles = [n["title"] for n in res.json()]
    assert "New high-priority patient" in titles

def test_mri_threshold_notification():
    headers = get_auth_header("clinician@neuropath.demo", "ClinicianPass2026!")
    db = SessionLocal()
    try:
        notification_service.notify_mri_capacity_threshold(db, 85.0, 80.0)
    finally:
        db.close()

    res = client.get("/api/notifications", headers=headers)
    titles = [n["title"] for n in res.json()]
    assert "MRI capacity threshold reached" in titles

def test_pet_queue_notification():
    headers = get_auth_header("clinician@neuropath.demo", "ClinicianPass2026!")
    db = SessionLocal()
    try:
        notification_service.notify_pet_queue_increase(db, 22, 16)
    finally:
        db.close()

    res = client.get("/api/notifications", headers=headers)
    titles = [n["title"] for n in res.json()]
    assert "PET evaluation queue increased" in titles

def test_csv_success_notification():
    headers = get_auth_header("clinician@neuropath.demo", "ClinicianPass2026!")
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "clinician@neuropath.demo").first()
        notification_service.notify_csv_import_success(db, user.id, 248, "test.csv")
    finally:
        db.close()

    res = client.get("/api/notifications", headers=headers)
    titles = [n["title"] for n in res.json()]
    assert "Cohort import completed" in titles

def test_csv_failure_notification():
    headers = get_auth_header("clinician@neuropath.demo", "ClinicianPass2026!")
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "clinician@neuropath.demo").first()
        notification_service.notify_csv_import_failure(db, user.id, "Invalid MMSE column format", "test_bad.csv")
    finally:
        db.close()

    res = client.get("/api/notifications", headers=headers)
    titles = [n["title"] for n in res.json()]
    assert "Cohort validation failed" in titles

def test_model_evaluation_notification():
    headers = get_auth_header("clinician@neuropath.demo", "ClinicianPass2026!")
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "clinician@neuropath.demo").first()
        notification_service.notify_model_evaluation_complete(db, user.id, "Random Forest", 0.91)
    finally:
        db.close()

    res = client.get("/api/notifications", headers=headers)
    titles = [n["title"] for n in res.json()]
    assert "Model evaluation completed" in titles

def test_security_notification():
    headers_admin = get_auth_header("admin@neuropath.demo", "AdminPass2026!")
    db = SessionLocal()
    try:
        notification_service.notify_security_event(db, "UNAUTHORIZED_ACCESS_ATTEMPT", details="IP 192.168.1.1 blocked")
    finally:
        db.close()

    res = client.get("/api/notifications", headers=headers_admin)
    titles = [n["title"] for n in res.json()]
    assert "Security event detected" in titles

def test_notification_persistence():
    headers = get_auth_header("clinician@neuropath.demo", "ClinicianPass2026!")
    res1 = client.get("/api/notifications", headers=headers)
    count1 = len(res1.json())
    assert count1 > 0

    res2 = client.get("/api/notifications", headers=headers)
    count2 = len(res2.json())
    assert count1 == count2
