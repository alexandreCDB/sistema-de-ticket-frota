# backend/schemas/message.py
from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime

# Schema base para uma mensagem
class MessageBase(BaseModel):
    content: str = Field(min_length=1) # Conteúdo da mensagem não pode ser vazio

# Schema para criar uma nova mensagem (requer apenas o conteúdo)
class MessageCreate(MessageBase):
    ticket_id: int # Precisa saber a qual ticket pertence
    sender_id: int # Precisa saber quem enviou

# Schema para retornar uma mensagem - RENOMEADO DE 'Message' PARA 'MessageResponse'
class MessageResponse(MessageBase): # <-- CORRIGIDO AQUI!
    id: int
    ticket_id: int
    sender_id: int
    sender_email:  Optional[str] = None
    sent_at: datetime

    class Config:
        from_attributes = True # ou orm_mode = True