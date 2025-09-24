import asyncio
import json
from sqlalchemy.orm import Session
from backend.models.user import User
from backend.ticket.crud import notification as notification_crud
from backend.ticket.crud import ticket as ticket_crud
from backend.database.database import SessionLocal
from backend.ticket.models.message import Message
from backend.ticket.models.notification import Notification, NotificationType
from backend.ticket.models.ticket import Ticket
from backend.websocket.service.ws_instance import manager

def notify_ticket_created(db: Session, user_id: int, ticket_id: int):

    # result = ticket_crud.get_ticket(db, ticket_id)
   
     notification_crud.create_notification(
        db=db,
        user_id=user_id,
        ticket_id=ticket_id,
        message="Novo ticket criado. Tk:"+ str(ticket_id),
        notif_type=NotificationType.ticket_created
    )

async def notify_ticket_created_async(user_id: int, ticket_id: int):
    # from db.session import SessionLocal
    db = SessionLocal()
    try:
        notification = notification_crud.create_notification(
            db=db,
            user_id=user_id,
            ticket_id=ticket_id,
            message="Novo ticket criado. Tk:"+ str(ticket_id),
            notif_type=NotificationType.ticket_created
        )
        db.commit()
       
        await manager.send_to_user(
            notification.user_id,
            "ticket_created",
            json.dumps({
                "id": notification.id,
                "ticket_id": ticket_id,
                "message": notification.message,
            })
        )
    except Exception as e:
        db.rollback()
        print(f"Erro ao criar notificação (async): {e}")
    finally:
        db.close()

def notify_message_sent(db: Session, user_id: int, ticket_id: int,message_id: int):
    result = ticket_crud.get_ticket(db, ticket_id)

    if result and result.assignee_id:
        note: Notification
        if user_id == result.assignee_id:
            note=  notification_crud.create_notification(
                db=db,
                user_id=result.requester_id,  
                ticket_id=ticket_id,
                message="Nova mensagem do tecnico. Tk:"+ str(ticket_id),
                notif_type=NotificationType.message_sent
            )
        else:
            note = notification_crud.create_notification(
                db=db,
                user_id=result.assignee_id,  
                ticket_id=ticket_id,
                message="Nova mensagem. Tk:"+ str(ticket_id),
                notif_type=NotificationType.message_sent
            )
        
        asyncio.create_task(notify_ticket_ws_message_not_async(user_id=note.user_id,id_msg=note.id, ticket=note.ticket,notif_type="ticket_message",msg=note.message))
        asyncio.create_task(notify_ticket_ws_message_async(db=db,user_id=note.user_id,id_msg=message_id,ticket=note.ticket,notif_type="ticket_message_page"))

    else:
        notification_crud.create_notification(
            db=db,
            user_id=user_id,
            ticket_id=ticket_id,
            message="Ninguém iniciou o chamado",
            notif_type=NotificationType.message_sent
        )

def notify_ticket_accept(db: Session, user_id: int, ticket_id: int):

    result = ticket_crud.get_ticket(db, ticket_id)
    note = notification_crud.create_notification(
        db=db,
        user_id=result.requester_id,
        ticket_id=ticket_id,
        message='Ticket iniciado. Tk:'+ str(ticket_id),
        notif_type=NotificationType.ticket_created
    )
    asyncio.create_task(notify_ticket_ws_message_not_async(user_id=note.user_id,id_msg=note.id, ticket=note.ticket,notif_type="ticket_started",msg=note.message))
    

def notify_ticket_close(db: Session, user_id: int, ticket_id: int):

    result = ticket_crud.get_ticket(db, ticket_id)
    note = notification_crud.create_notification(
        db=db,
        user_id=result.requester_id,
        ticket_id=ticket_id,
        message='Ticket finalizado. Tk:'+ str(ticket_id),
        notif_type=NotificationType.ticket_created
    )
    asyncio.create_task(notify_ticket_ws_message_not_async(user_id=note.user_id,id_msg=note.id, ticket=note.ticket,notif_type="ticket_finish",msg=note.message))   

async def notify_ticket_ws_async(user_id: int, ticket:Ticket, notif_type: str,msg: str=""):
    try:       
        await manager.send_to_user(
            user_id,
            notif_type,
            {
                "ticket_id": ticket.id,
                "message": msg,
            }
        )
    except Exception as e:
        print(f"Erro ao criar notificação ws (async): {e}")
        
async def notify_ticket_ws_message_not_async(user_id: int,id_msg:int, ticket:Ticket, notif_type: str,msg: str=""):
    try:       
        await manager.send_to_user(
            user_id,
            notif_type,
            {
                "id": id_msg,
                "ticket_id": ticket.id,
                "message": msg,
            }
        )
    except Exception as e:
        print(f"Erro ao criar notificação ws (async): {e}")

async def notify_ticket_wsb_async( ticket: Ticket,msg: str, notif_type: str):
    try:       
        await manager.broadcast(
           notif_type,
            {
                "ticket_id": ticket.id,
                "message": msg,
            }
        )
    except Exception as e:
        print(f"Erro ao criar notificação ws (async): {e}")
        
        
async def notify_ticket_ws_message_async(db: Session,user_id: int, id_msg: int, ticket: Ticket, notif_type: str):
    try:
        print("id_msg:", id_msg)
        # Busca a mensagem
        message: Message = db.query(Message).filter(Message.id == id_msg).first()
        if not message:
            print(f"Mensagem {id_msg} não encontrada")
            return

        
        message = (
                    db.query(Message)
                    .join(User, Message.sender_id == User.id)
                    .filter(Message.id == id_msg)
                    .order_by(Message.sent_at)
                    .first()  
                )
        msg:str=""
        if message:
                msg = {
                    "id": message.id,
                    "ticket_id": message.ticket_id,
                    "sender_id": message.sender_id,
                    "sender_email": message.sender.email,  # acessa o relacionamento
                    "content": message.content,
                    "sent_at": message.sent_at.isoformat()  # Formata a data como string ISO
            }
        await manager.send_to_user(
            user_id,
            notif_type,
            msg
        )

    except Exception as e:
        print(f"Erro ao criar notificação ws (async): {e}")
