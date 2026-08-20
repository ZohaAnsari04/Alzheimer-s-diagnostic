from sqlalchemy.orm import Session
from app.database.models import AuditLog
from typing import Optional, List, Tuple
from datetime import datetime

def log_action(
    db: Session,
    user: str,
    action: str,
    resource: str,
    status: str = "Success",
    details: Optional[str] = None
) -> AuditLog:
    entry = AuditLog(
        timestamp=datetime.utcnow(),
        user=user,
        action=action,
        resource=resource,
        status=status,
        details=details
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

def get_audit_logs(
    db: Session,
    limit: int = 50,
    offset: int = 0
) -> Tuple[int, List[AuditLog]]:
    total = db.query(AuditLog).count()
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).offset(offset).limit(limit).all()
    return total, logs
