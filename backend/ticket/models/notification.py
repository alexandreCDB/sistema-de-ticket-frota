#
# Arquivo: backend/ticket/models/notification.py
#
from datetime import datetime
from sqlalchemy import Boolean, Column, Enum, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from backend.database.database import Base

# --- CORREÇÃO IMPORTANTE 1 ---
# Importa a classe User do seu novo local global.
from backend.models.user import User

class NotificationType(str, enum.Enum):
    ticket_created = "ticket_created"
    message_sent = "message_sent" 
    frota_checkout = "frota_checkout"
    frota_return = "frota_return"
    frota_solicitation = "frota_solicitation"
    fuel_reminder = "fuel_reminder"

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=True)
    vehicle_id = Column(Integer, nullable=True)
    message = Column(String, nullable=True)
    notification_type = Column(Enum(NotificationType), nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)     

    # --- CORREÇÃO IMPORTANTE 2 ---
    # Removemos 'back_populates' do relacionamento com User.
    user = relationship("User")
    ticket = relationship("Ticket", back_populates="notifications")