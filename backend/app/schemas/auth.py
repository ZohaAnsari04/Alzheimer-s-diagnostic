from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime

class LoginRequest(BaseModel):
    email: str = Field(..., description="Clinician / User email address")
    password: str = Field(..., min_length=6, description="User password")

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime
    last_login_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "CLINICIAN"

class DemoUserPublicInfo(BaseModel):
    email: str
    full_name: str
    role: str
    title: str
    institution: str
