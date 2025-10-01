from pydantic import BaseModel
from datetime import datetime
from enum import Enum
from typing import Optional

class NotificationType(str, Enum):
    ticket_created = "ticket_created"
    message_sent = "message_sent" 
    frota_checkout = "frota_checkout"
    frota_return = "frota_return"
    frota_solicitation = "frota_solicitation"

class NotificationSchema(BaseModel):
    id: int
    user_id: int
    ticket_id: Optional[int] = None
    vehicle_id: Optional[int] = None
    message: Optional[str] = None
    notification_type: NotificationType
    is_read: bool
    created_at: datetime

    class Config:
        orm_mode = True
