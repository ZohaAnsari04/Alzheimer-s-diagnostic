from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from typing import List
from app.database.connection import get_db
from app.database.models import User
from app.schemas.auth import LoginRequest, TokenResponse, UserResponse, DemoUserPublicInfo
from app.services.auth_service import (
    verify_password, create_access_token, seed_demo_users_if_empty
)
from app.services.audit_service import log_action
from app.api.auth_deps import get_current_user
from app.utils.config import settings

router = APIRouter()

@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticates user credentials against backend bcrypt password hashes,
    updates last login timestamp, logs audit event, and returns signed JWT access token.
    """
    seed_demo_users_if_empty(db)

    normalized_email = request.email.strip().lower()
    user = db.query(User).filter(User.email == normalized_email).first()

    # Generic authentication failure to prevent user enumeration
    if not user or not verify_password(request.password, user.password_hash):
        log_action(
            db,
            user=normalized_email,
            action="LOGIN_FAILURE",
            resource="API /auth/login",
            status="Failed",
            details="Invalid email or password provided"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if not user.is_active:
        log_action(
            db,
            user=user.email,
            action="LOGIN_FAILURE",
            resource="API /auth/login",
            status="Warning",
            details="Login attempted on inactive user account"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive. Please contact administrator."
        )

    # Update last login timestamp
    user.last_login_at = datetime.now(timezone.utc)
    db.commit()

    # Generate JWT access token
    token_payload = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "full_name": user.full_name
    }
    access_token = create_access_token(token_payload)

    log_action(
        db,
        user=user.email,
        action="LOGIN_SUCCESS",
        resource="API /auth/login",
        status="Success",
        details=f"User authenticated successfully as role {user.role}"
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
def get_current_authenticated_user(current_user: User = Depends(get_current_user)):
    """
    Returns authenticated user profile from verified JWT Bearer token.
    Backend source of truth for user identity & authorization role.
    """
    return UserResponse.model_validate(current_user)

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Logs user logout event. Short-lived access token expires client-side.
    """
    log_action(
        db,
        user=current_user.email,
        action="LOGOUT",
        resource="API /auth/logout",
        status="Success",
        details=f"User {current_user.email} logged out successfully"
    )
    return {"status": "success", "message": "Successfully logged out of workspace session."}

@router.get("/demo-credentials", response_model=List[DemoUserPublicInfo])
def get_demo_credentials():
    """
    Returns public list of pre-configured evaluation demo accounts for 1-click login assistance.
    """
    return [
        DemoUserPublicInfo(
            email="clinician@neuropath.demo",
            full_name="Dr. Sarah Chen, MD",
            role="CLINICIAN",
            title="Senior Neurologist Reviewer",
            institution="Mayo Clinic"
        ),
        DemoUserPublicInfo(
            email="admin@neuropath.demo",
            full_name="Dr. Marcus Vance",
            role="ADMIN",
            title="Clinical Operations Director",
            institution="Johns Hopkins"
        ),
        DemoUserPublicInfo(
            email="evaluator@neuropath.demo",
            full_name="Elena Rostova, MSc",
            role="EVALUATOR",
            title="Lead AI Trial Evaluator",
            institution="Benchmark Health"
        )
    ]
