import jwt
import bcrypt
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from app.database.models import User
from app.utils.config import settings

def hash_password(password: str) -> str:
    """Hashes plaintext password using standard bcrypt with salt."""
    pwd_bytes = password.encode('utf-8')
    if len(pwd_bytes) > 72:
        pwd_bytes = pwd_bytes[:72]
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plaintext password against a stored bcrypt hash."""
    pwd_bytes = plain_password.encode('utf-8')
    if len(pwd_bytes) > 72:
        pwd_bytes = pwd_bytes[:72]
    try:
        return bcrypt.checkpw(pwd_bytes, hashed_password.encode('utf-8'))
    except Exception:
        return False

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Generates a signed JWT access token containing minimal claims (sub, email, role)."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({
        "exp": int(expire.timestamp()),
        "iat": int(now.timestamp()),
        "type": "access"
    })
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodes and validates a JWT access token using system secret key."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None

def seed_demo_users_if_empty(db: Session):
    """Idempotently seeds standard evaluation demo accounts into SQLite database."""
    from app.database.models import Base
    Base.metadata.create_all(bind=db.get_bind())

    demo_accounts = [
        {
            "email": "clinician@neuropath.demo",
            "password": "ClinicianPass2026!",
            "full_name": "Dr. Sarah Chen, MD",
            "role": "CLINICIAN"
        },
        {
            "email": "admin@neuropath.demo",
            "password": "AdminPass2026!",
            "full_name": "Dr. Marcus Vance",
            "role": "ADMIN"
        },
        {
            "email": "evaluator@neuropath.demo",
            "password": "EvaluatorPass2026!",
            "full_name": "Elena Rostova, MSc",
            "role": "EVALUATOR"
        }
    ]

    for acc in demo_accounts:
        existing = db.query(User).filter(User.email == acc["email"].lower()).first()
        if not existing:
            user = User(
                email=acc["email"].lower(),
                password_hash=hash_password(acc["password"]),
                full_name=acc["full_name"],
                role=acc["role"],
                is_active=True
            )
            db.add(user)
    db.commit()
