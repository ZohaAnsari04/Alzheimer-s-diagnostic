from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List

class AuditLogCreate(BaseModel):
    user: str
    action: str
    resource: str
    status: Optional[str] = "Success"
    details: Optional[str] = None

class AuditLogResponse(AuditLogCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    timestamp: datetime

class AuditLogListResponse(BaseModel):
    total: int
    logs: List[AuditLogResponse]
