from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Callable
from app.database.connection import get_db
from app.database.models import User
from app.services.auth_service import decode_access_token
from app.services.audit_service import log_action
from app.services.notification_service import notify_security_event

security = HTTPBearer(auto_error=True)

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    FastAPI dependency validating incoming Bearer JWT tokens and loading the authenticated user.
    """
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing user subject claim.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user record not found.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive. Access denied."
        )

    return user

def require_role(required_role: str) -> Callable:
    """FastAPI dependency enforcing exact single role authorization."""
    def role_checker(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> User:
        if current_user.role.upper() != required_role.upper():
            log_action(
                db,
                user=current_user.email,
                action="FORBIDDEN_ROLE_ACCESS",
                resource=f"Required: {required_role}, Present: {current_user.role}",
                status="Warning",
                details=f"Access denied for user {current_user.email} with role {current_user.role}"
            )
            notify_security_event(
                db,
                event_type="FORBIDDEN_ROLE_ACCESS",
                user_id=current_user.id,
                details=f"Unauthorized attempt by {current_user.email} (Role: {current_user.role}) for {required_role} resource."
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Action requires '{required_role}' privileges. Current role: '{current_user.role}'."
            )
        return current_user
    return role_checker

def require_any_role(allowed_roles: List[str]) -> Callable:
    """FastAPI dependency enforcing multi-role authorization."""
    allowed_upper = [r.upper() for r in allowed_roles]
    def role_checker(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> User:
        if current_user.role.upper() not in allowed_upper:
            log_action(
                db,
                user=current_user.email,
                action="FORBIDDEN_ROLE_ACCESS",
                resource=f"Allowed: {', '.join(allowed_roles)}, Present: {current_user.role}",
                status="Warning",
                details=f"Access denied for user {current_user.email} with role {current_user.role}"
            )
            notify_security_event(
                db,
                event_type="FORBIDDEN_ROLE_ACCESS",
                user_id=current_user.id,
                details=f"Unauthorized attempt by {current_user.email} (Role: {current_user.role}) for [{', '.join(allowed_roles)}] resource."
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Action requires one of [{', '.join(allowed_roles)}] privileges. Current role: '{current_user.role}'."
            )
        return current_user
    return role_checker
