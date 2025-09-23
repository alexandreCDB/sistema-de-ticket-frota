import asyncio
import json
from sqlalchemy.orm import Session
from backend.ticket.crud import notification as notification_crud
from backend.ticket.crud import ticket as ticket_crud
from backend.database.database import SessionLocal
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
       
        # await manager.broadcast(
        #     json.dumps({
        #         "id": notification.id,
        #         "ticket_id": ticket_id,
        #         "message": notification.message,
        #         "type": NotificationType.ticket_created,
        #     })
        # )
    except Exception as e:
        db.rollback()
        print(f"Erro ao criar notificação (async): {e}")
    finally:
        db.close()

def notify_message_sent(db: Session, user_id: int, ticket_id: int):
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
        
        asyncio.create_task(notify_ticket_ws_async(user_id=result.requester_id, ticket=note.ticket,notif_type="ticket_message",msg=note.message))
        # await manager.broadcast(
        #     json.dumps({
        #         "id": notification.id,
        #         "ticket_id": ticket_id,
        #         "message": notification.message,
        #         "type": NotificationType.ticket_created,
        #     })
        # )

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
    notification_crud.create_notification(
        db=db,
        user_id=result.requester_id,
        ticket_id=ticket_id,
        message='Ticket iniciado. Tk:'+ str(ticket_id),
        notif_type=NotificationType.ticket_created
    )

def notify_ticket_close(db: Session, user_id: int, ticket_id: int):

    result = ticket_crud.get_ticket(db, ticket_id)
    notification_crud.create_notification(
        db=db,
        user_id=result.requester_id,
        ticket_id=ticket_id,
        message='Ticket finalizado. Tk:'+ str(ticket_id),
        notif_type=NotificationType.ticket_created
    )   

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