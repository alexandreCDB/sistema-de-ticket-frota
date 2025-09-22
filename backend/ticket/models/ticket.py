from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from backend.database.database import Base  # 🔹 agora usa a Base global
from backend.models.user import User        # 🔹 importa o User global

class TicketStatus(str, enum.Enum):
    open = "aberto"
    in_progress = "em progresso"
    resolved = "resolvido"
    closed = "fechado"
    waiting_for_user = "esperando usuario"
    cancelled = "cancelado"

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(String, nullable=False)
    status = Column(String, default=TicketStatus.open.value, nullable=False)
    priority = Column(String, nullable=False)
    category = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())
    requester_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assignee_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    attachment_url = Column(String, nullable=True)
    observation = Column(String, nullable=True)

    # 🔹 Corrigido: usa "User" (classe), não "users" (tabela)
    requester = relationship("User", foreign_keys=[requester_id])
    assignee = relationship("User", foreign_keys=[assignee_id])

    # continua com os relacionamentos internos
    notifications = relationship("Notification", back_populates="ticket")
    messages = relationship("Message", back_populates="ticket", order_by="Message.sent_at")
