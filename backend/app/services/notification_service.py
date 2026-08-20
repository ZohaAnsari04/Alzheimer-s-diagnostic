from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional, Dict, Any
from app.database.models import Notification, User

def create_notification(
    db: Session,
    user_id: int,
    type: str,
    severity: str,
    title: str,
    message: str,
    patient_id: Optional[str] = None,
    route: Optional[str] = None,
    event_key: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None
) -> Optional[Notification]:
    """Creates a user notification with event-key deduplication."""
    if event_key:
        existing = db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.event_key == event_key
        ).first()
        if existing:
            return existing

    notification = Notification(
        user_id=user_id,
        type=type,
        severity=severity,
        title=title,
        message=message,
        patient_id=patient_id,
        route=route,
        event_key=event_key,
        metadata_json=metadata,
        created_at=datetime.utcnow(),
        is_read=False
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification

def broadcast_notification_to_role(
    db: Session,
    target_role: Optional[str],
    type: str,
    severity: str,
    title: str,
    message: str,
    patient_id: Optional[str] = None,
    route: Optional[str] = None,
    event_key_prefix: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None
) -> List[Notification]:
    """Broadcasts a notification to all active users matching a role (or all users if role is None)."""
    from app.services.auth_service import seed_demo_users_if_empty
    seed_demo_users_if_empty(db)

    query = db.query(User).filter(User.is_active != False)
    if target_role:
        query = query.filter(User.role == target_role.upper())
    users = query.all()

    notifications = []
    for user in users:
        event_key = f"{event_key_prefix}_u{user.id}" if event_key_prefix else None
        notif = create_notification(
            db=db,
            user_id=user.id,
            type=type,
            severity=severity,
            title=title,
            message=message,
            patient_id=patient_id,
            route=route,
            event_key=event_key,
            metadata=metadata
        )
        if notif:
            notifications.append(notif)
    return notifications

# --- EVENT-BASED NOTIFICATION HELPERS ---

def notify_high_priority_patient(
    db: Session,
    patient_id: str,
    priority_score: float,
    previous_priority: str = "MEDIUM"
):
    """Triggers WARNING notification when a patient transitions to HIGH priority."""
    event_key_prefix = f"HIGH_PRIORITY_{patient_id}_{int(priority_score)}"
    broadcast_notification_to_role(
        db=db,
        target_role=None, # All clinicians & admins
        type="HIGH_PRIORITY_PATIENT",
        severity="WARNING",
        title="New high-priority patient",
        message=f"Patient {patient_id} has entered the high-priority evaluation queue (score: {int(priority_score)}).",
        patient_id=patient_id,
        route=f"/patients/{patient_id}",
        event_key_prefix=event_key_prefix,
        metadata={
            "patient_id": patient_id,
            "priority_score": priority_score,
            "previous_priority": previous_priority,
            "new_priority": "HIGH"
        }
    )

def notify_mri_capacity_threshold(
    db: Session,
    utilization: float,
    threshold: float = 80.0
):
    """Triggers WARNING notification when MRI capacity crosses configured threshold."""
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    event_key_prefix = f"MRI_CAPACITY_{today_str}_{int(utilization)}"
    broadcast_notification_to_role(
        db=db,
        target_role=None,
        type="MRI_CAPACITY",
        severity="WARNING",
        title="MRI capacity threshold reached",
        message=f"MRI utilization has reached {int(utilization)}%. Review current evaluation demand.",
        route="/analytics",
        event_key_prefix=event_key_prefix,
        metadata={
            "utilization": utilization,
            "threshold": threshold
        }
    )

def notify_pet_queue_increase(
    db: Session,
    current_count: int,
    previous_count: int
):
    """Triggers WARNING notification when PET candidate queue increases meaningfully."""
    increase = current_count - previous_count
    if increase <= 0:
        return
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    event_key_prefix = f"PET_QUEUE_{today_str}_{current_count}"
    broadcast_notification_to_role(
        db=db,
        target_role=None,
        type="PET_QUEUE",
        severity="WARNING",
        title="PET evaluation queue increased",
        message=f"{increase} additional patient{'s are' if increase > 1 else ' is'} currently prioritized for PET evaluation.",
        route="/pathway",
        event_key_prefix=event_key_prefix,
        metadata={
            "current_count": current_count,
            "previous_count": previous_count,
            "increase": increase
        }
    )

def notify_csv_import_success(
    db: Session,
    user_id: int,
    rows_imported: int,
    filename: str = "upload.csv"
):
    """Triggers SUCCESS notification when CSV cohort import completes."""
    create_notification(
        db=db,
        user_id=user_id,
        type="CSV_IMPORT_SUCCESS",
        severity="SUCCESS",
        title="Cohort import completed",
        message=f"{rows_imported} patient records were successfully validated and imported.",
        route="/data",
        event_key=f"CSV_SUCCESS_{user_id}_{rows_imported}_{filename}_{int(datetime.utcnow().timestamp())}",
        metadata={
            "rows_imported": rows_imported,
            "filename": filename
        }
    )

def notify_csv_import_failure(
    db: Session,
    user_id: int,
    error_detail: str,
    filename: str = "upload.csv"
):
    """Triggers CRITICAL notification when CSV cohort import fails validation."""
    create_notification(
        db=db,
        user_id=user_id,
        type="CSV_IMPORT_FAILURE",
        severity="CRITICAL",
        title="Cohort validation failed",
        message="Patient cohort import was rejected due to validation errors.",
        route="/data",
        event_key=f"CSV_FAIL_{user_id}_{filename}_{int(datetime.utcnow().timestamp())}",
        metadata={
            "error_detail": error_detail,
            "filename": filename
        }
    )

def notify_model_evaluation_complete(
    db: Session,
    user_id: Optional[int],
    model_type: str,
    roc_auc: Optional[float] = None
):
    """Triggers INFO notification when model evaluation/training finishes."""
    msg = f"{model_type} evaluation completed successfully."
    if roc_auc is not None:
        msg += f" ROC-AUC: {roc_auc:.2f}."

    if user_id:
        create_notification(
            db=db,
            user_id=user_id,
            type="MODEL_EVALUATION",
            severity="INFO",
            title="Model evaluation completed",
            message=msg,
            route="/model",
            event_key=f"MODEL_EVAL_{user_id}_{model_type}_{int(datetime.utcnow().timestamp())}",
            metadata={
                "model_type": model_type,
                "roc_auc": roc_auc
            }
        )
    else:
        broadcast_notification_to_role(
            db=db,
            target_role=None,
            type="MODEL_EVALUATION",
            severity="INFO",
            title="Model evaluation completed",
            message=msg,
            route="/model",
            event_key_prefix=f"MODEL_EVAL_{model_type}_{int(datetime.utcnow().timestamp())}",
            metadata={
                "model_type": model_type,
                "roc_auc": roc_auc
            }
        )

def notify_security_event(
    db: Session,
    event_type: str,
    user_id: Optional[int] = None,
    details: Optional[str] = None
):
    """Triggers WARNING security notification to ADMIN role or specific user."""
    broadcast_notification_to_role(
        db=db,
        target_role="ADMIN",
        type="SECURITY_AUDIT",
        severity="WARNING",
        title="Security event detected",
        message=f"A security event ({event_type}) was flagged by the system.",
        route="/security",
        event_key_prefix=f"SEC_{event_type}_{int(datetime.utcnow().timestamp())}",
        metadata={
            "event_type": event_type,
            "details": details
        }
    )

# --- QUERY & STATE HELPERS ---

def get_user_notifications(
    db: Session,
    user_id: int,
    limit: int = 20,
    unread_only: bool = False
) -> List[Notification]:
    query = db.query(Notification).filter(Notification.user_id == user_id)
    if unread_only:
        query = query.filter(Notification.is_read == False)
    return query.order_by(Notification.created_at.desc()).limit(limit).all()

def get_unread_count(db: Session, user_id: int) -> int:
    return db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).count()

def mark_as_read(db: Session, notification_id: int, user_id: int) -> Optional[Notification]:
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user_id
    ).first()
    if notif:
        notif.is_read = True
        notif.read_at = datetime.utcnow()
        db.commit()
        db.refresh(notif)
    return notif

def mark_all_as_read(db: Session, user_id: int) -> int:
    count = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).update({
        "is_read": True,
        "read_at": datetime.utcnow()
    }, synchronize_session=False)
    db.commit()
    return count
