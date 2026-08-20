from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, Dict, Any
from datetime import datetime

class NotificationResponse(BaseModel):
    id: int
    type: str
    severity: str
    title: str
    message: str
    created_at: datetime
    read_at: Optional[datetime] = None
    is_read: bool
    patient_id: Optional[str] = None
    route: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = Field(default=None, alias="metadata_json")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class UnreadCountResponse(BaseModel):
    count: int

class NotificationCreate(BaseModel):
    user_id: int
    type: str
    severity: str = "INFO"
    title: str
    message: str
    patient_id: Optional[str] = None
    route: Optional[str] = None
    event_key: Optional[str] = None
    metadata_json: Optional[Dict[str, Any]] = None
