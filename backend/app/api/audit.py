from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import User
from app.schemas.audit import AuditLogListResponse
from app.services.audit_service import get_audit_logs, log_action
from app.api.auth_deps import get_current_user, require_role

router = APIRouter()

@router.get("", response_model=AuditLogListResponse)
def list_audit_logs(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total, logs = get_audit_logs(db, limit=limit, offset=offset)
    return AuditLogListResponse(total=total, logs=logs)

@router.post("/log")
def create_manual_audit_entry(
    action: str = Query(...),
    resource: str = Query(...),
    details: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN"))
):
    entry = log_action(db, user=current_user.email, action=action, resource=resource, details=details)
    return {"status": "success", "id": entry.id}
