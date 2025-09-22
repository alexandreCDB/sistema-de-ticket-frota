#
# Arquivo: backend/ticket/models/message.py
#
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from backend.database.database import Base
from datetime import datetime

# --- CORREÇÃO IMPORTANTE 1 ---
# Importa a classe User do seu novo local global.
from backend.models.user import User

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(String, nullable=False)
    sent_at = Column(DateTime, default=datetime.now, nullable=False)

    ticket = relationship("Ticket", back_populates="messages")
    
    # --- CORREÇÃO IMPORTANTE 2 ---
    # Removemos 'back_populates' do relacionamento com User.
    sender = relationship("User")

    def __repr__(self):
        return f"<Message(id={self.id}, ticket_id={self.ticket_id}, sender_id={self.sender_id}, sent_at='{self.sent_at}')>"