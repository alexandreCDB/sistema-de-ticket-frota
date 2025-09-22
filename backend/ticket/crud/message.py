# backend/crud/message.py
from sqlalchemy.orm import Session
from backend.ticket.models.message import Message
from backend.ticket.models.ticket import Ticket # Para verificar se o ticket existe
from backend.models.user import User
from backend.ticket.schemas.message import MessageCreate
from datetime import datetime
from backend.ticket.events.notification import notify_message_sent

# Obter uma mensagem pelo ID
def get_message(db: Session, message_id: int):
    return db.query(Message).filter(Message.id == message_id).first()

# Obter todas as mensagens para um ticket específico
def get_messages_by_ticket(db: Session, ticket_id: int, skip: int = 0, limit: int = 100):
    messages = (
            db.query(Message)
            .join(User, Message.sender_id == User.id)
            .filter(Message.ticket_id == ticket_id)
            .order_by(Message.sent_at)
            .offset(skip)
            .limit(limit)
            .all()
        )
    result = [
            {
                "id": msg.id,
                "ticket_id": msg.ticket_id,
                "sender_id": msg.sender_id,
                "sender_email": msg.sender.email,  # <-- acessa o relacionamento
                "content": msg.content,
                "sent_at": msg.sent_at
            }
            for msg in messages
        ]

    return result



    # return db.query(Message).filter(Message.ticket_id == ticket_id).order_by(Message.sent_at).offset(skip).limit(limit).all()

# Criar uma nova mensagem para um ticket
def create_message(db: Session, message: MessageCreate):
    # Opcional: Verificar se o ticket_id e sender_id existem antes de criar a mensagem
    # Isso pode ser feito no router para melhor feedback ao usuário
    db_message = Message(
        ticket_id=message.ticket_id,
        sender_id=message.sender_id,
        content=message.content,
        sent_at=datetime.now() # Garante que a data é definida no momento da criação
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)

   ######################################## Evento para criar msg - att wallace
    notify_message_sent(db, user_id=db_message.sender_id, ticket_id=db_message.ticket_id)


    return db_message

# Note: Não estamos implementando update/delete para mensagens por padrão,
# pois mensagens em um histórico geralmente são imutáveis.