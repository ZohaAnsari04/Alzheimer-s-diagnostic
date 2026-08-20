from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.connection import get_db
from app.database.models import User
from app.api.auth_deps import get_current_user
from app.schemas.notification import NotificationResponse, UnreadCountResponse
from app.services import notification_service

router = APIRouter()

@router.get("", response_model=List[NotificationResponse])
def get_user_notifications(
    limit: int = Query(20, ge=1, le=100),
    unread_only: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Returns the authenticated user's notifications."""
    notifs = notification_service.get_user_notifications(
        db=db,
        user_id=current_user.id,
        limit=limit,
        unread_only=unread_only
    )
    return notifs

@router.get("/unread-count", response_model=UnreadCountResponse)
def get_user_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Returns the authenticated user's unread notification count."""
    count = notification_service.get_unread_count(db=db, user_id=current_user.id)
    return {"count": count}

@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Marks a single notification belonging to the authenticated user as read."""
    notif = notification_service.mark_as_read(
        db=db,
        notification_id=notification_id,
        user_id=current_user.id
    )
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found or access denied.")
    return notif

@router.patch("/read-all")
def mark_all_notifications_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Marks all unread notifications of the authenticated user as read."""
    count = notification_service.mark_all_as_read(db=db, user_id=current_user.id)
    return {"status": "success", "count": count}

@router.post("/demo-trigger")
def trigger_demo_notifications(
    event_type: Optional[str] = Query("all", description="high_priority, mri_capacity, pet_queue, csv_success, model_eval, security, or all"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Developer/Evaluator trigger to generate realistic demo notifications for testing."""
    if event_type in ["high_priority", "all"]:
        notification_service.notify_high_priority_patient(db, patient_id="P-1042", priority_score=84.5, previous_priority="MEDIUM")
    
    if event_type in ["mri_capacity", "all"]:
        notification_service.notify_mri_capacity_threshold(db, utilization=83.0, threshold=80.0)

    if event_type in ["pet_queue", "all"]:
        notification_service.notify_pet_queue_increase(db, current_count=21, previous_count=15)

    if event_type in ["csv_success", "all"]:
        notification_service.notify_csv_import_success(db, user_id=current_user.id, rows_imported=248, filename="adni_benchmark_248.csv")

    if event_type in ["model_eval", "all"]:
        notification_service.notify_model_evaluation_complete(db, user_id=current_user.id, model_type="Random Forest Classifier", roc_auc=0.91)

    if event_type in ["security", "all"]:
        notification_service.notify_security_event(db, event_type="UNAUTHORIZED_API_ACCESS", user_id=current_user.id, details="Blocked 1 unauthenticated request to /api/model/algorithm")

    return {"status": "success", "message": f"Demo notifications triggered for '{event_type}'."}
