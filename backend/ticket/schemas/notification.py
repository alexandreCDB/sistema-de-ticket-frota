from pydantic import BaseModel
from datetime import datetime
from enum import Enum
from typing import Optional

class NotificationType(str, Enum):
    ticket_created = "ticket_created"
    message_sent = "message_sent"

class NotificationSchema(BaseModel):
    id: int
    user_id: int
    ticket_id: int
    message: Optional[str]
    notification_type: NotificationType
    is_read: bool
    created_at: datetime

    class Config:
        orm_mode = True
