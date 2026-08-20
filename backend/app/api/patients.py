from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timezone
from app.database.connection import get_db
from app.database.models import Patient, User
from app.schemas.patient import PatientResponse, PatientListResponse
from app.services.patient_service import seed_database_if_empty, parse_and_import_csv
from app.services.audit_service import log_action
from app.api.auth_deps import get_current_user, require_any_role
from app.services.notification_service import notify_csv_import_success, notify_csv_import_failure

router = APIRouter()

class StatusUpdateRequest(BaseModel):
    review_status: str
    notes: Optional[str] = None

@router.get("", response_model=PatientListResponse)
def get_patients(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    priority_level: Optional[str] = None,
    current_stage: Optional[str] = None,
    sort_by: str = Query("priority_score", description="priority_score, age, patient_id"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    seed_database_if_empty(db)

    query = db.query(Patient)

    if search:
        query = query.filter(Patient.patient_id.ilike(f"%{search}%"))

    if current_stage:
        query = query.filter(Patient.current_stage == current_stage)

    if priority_level:
        query = query.join(Patient.prioritization_result).filter(Patient.prioritization_result.has(priority_level=priority_level))

    if sort_by == "priority_score":
        query = query.join(Patient.prioritization_result).order_by(Patient.prioritization_result.property.mapper.class_.priority_score.desc())
    elif sort_by == "age":
        query = query.order_by(Patient.age.desc())
    else:
        query = query.order_by(Patient.patient_id.asc())

    total = query.count()
    patients = query.offset((page - 1) * page_size).limit(page_size).all()

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "patients": patients
    }

@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient_detail(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    seed_database_if_empty(db)

    patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient '{patient_id}' not found.")

    log_action(db, user=current_user.email, action="View Patient Record", resource=patient_id)
    return patient

@router.patch("/{patient_id}/status")
def update_patient_status(
    patient_id: str,
    payload: StatusUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient '{patient_id}' not found.")

    old_status = patient.review_status
    patient.review_status = payload.review_status
    patient.updated_at = datetime.now(timezone.utc)
    db.commit()

    log_action(
        db,
        user=current_user.email,
        action="Update Patient Status",
        resource=patient_id,
        status="Success",
        details=f"Status changed from '{old_status}' to '{payload.review_status}'. Notes: {payload.notes or 'None'}"
    )

    return {
        "status": "success",
        "patient_id": patient_id,
        "review_status": patient.review_status,
        "updated_at": patient.updated_at.isoformat()
    }

@router.post("/upload")
async def upload_csv_data(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_role(["ADMIN", "EVALUATOR"]))
):
    if not file.filename.endswith(".csv"):
        notify_csv_import_failure(db, user_id=current_user.id, error_detail="Only CSV files are supported.", filename=file.filename)
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    content = await file.read()
    imported_count, errors = parse_and_import_csv(content, db)

    if imported_count == 0 and errors:
        error_msg = "; ".join(errors)
        notify_csv_import_failure(db, user_id=current_user.id, error_detail=error_msg, filename=file.filename)
        log_action(db, user=current_user.email, action="CSV Upload Failed", resource=file.filename, status="Failed", details=error_msg)
        raise HTTPException(status_code=400, detail=f"Unable to import dataset: {error_msg}")

    notify_csv_import_success(db, user_id=current_user.id, rows_imported=imported_count, filename=file.filename)
    log_action(db, user=current_user.email, action="CSV Dataset Import", resource=file.filename, status="Success", details=f"Imported {imported_count} patient records.")
    return {
        "status": "success",
        "imported_count": imported_count,
        "warnings": errors,
        "message": f"Successfully ingested {imported_count} patient records."
    }
