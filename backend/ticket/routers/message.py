#
# Arquivo: backend/ticket/routers/message.py
#
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.database.database import get_db
from backend.ticket.schemas.message import MessageResponse, MessageCreate
from backend.ticket.crud import message as crud_message
from backend.ticket.crud import ticket as crud_ticket
from backend.dependencies import get_current_user

# --- CORREÇÃO AQUI ---
# Importamos 'UserRead' do local correto em vez do antigo 'User'.
from backend.ticket.schemas.user import UserRead

router = APIRouter(
    prefix="/tickets/{ticket_id}/messages",
    tags=["messages"],
    responses={404: {"description": "Ticket or User not found"}},
)

@router.post("/", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def create_message_for_ticket(
    ticket_id: int,
    message: MessageCreate,
    db: Session = Depends(get_db),
    # --- CORREÇÃO AQUI ---
    # Usamos o type hint 'UserRead' para o usuário logado.
    current_user: UserRead = Depends(get_current_user)
):
    message.sender_id = current_user.id
    if message.ticket_id != ticket_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ticket ID in URL must match ticket_id in message body"
        )

    db_ticket = crud_ticket.get_ticket(db, ticket_id=ticket_id)
    if not db_ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    return crud_message.create_message(db=db, message=message)

@router.get("/", response_model=List[MessageResponse])
async def read_messages_for_ticket(
    ticket_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    # --- CORREÇÃO AQUI ---
    # Usamos o type hint 'UserRead' para o usuário logado.
    current_user: UserRead = Depends(get_current_user)
):
    db_ticket = crud_ticket.get_ticket(db, ticket_id=ticket_id)
    if not db_ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    if not current_user.is_admin and db_ticket.requester_id != current_user.id and db_ticket.assignee_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view messages for this ticket")

    messages = crud_message.get_messages_by_ticket(db, ticket_id=ticket_id, skip=skip, limit=limit)
    return messages

@router.get("/{message_id}", response_model=MessageResponse)
async def read_message(
    ticket_id: int,
    message_id: int,
    db: Session = Depends(get_db),
    # --- CORREÇÃO AQUI ---
    # Usamos o type hint 'UserRead' para o usuário logado.
    current_user: UserRead = Depends(get_current_user)
):
    db_message = crud_message.get_message(db, message_id=message_id)
    if not db_message or db_message.ticket_id != ticket_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found in this ticket")

    db_ticket = crud_ticket.get_ticket(db, ticket_id=ticket_id)
    if not current_user.is_admin and db_ticket.requester_id != current_user.id and db_ticket.assignee_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this message")

    return db_message