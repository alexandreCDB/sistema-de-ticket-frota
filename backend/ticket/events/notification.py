from sqlalchemy.orm import Session
from backend.ticket.crud import notification as notification_crud
from backend.ticket.crud import ticket as ticket_crud
from backend.database.database import SessionLocal
from backend.ticket.models.notification import NotificationType

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
        notification_crud.create_notification(
            db=db,
            user_id=user_id,
            ticket_id=ticket_id,
            message="Novo ticket criado. Tk:"+ str(ticket_id),
            notif_type=NotificationType.ticket_created
        )
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Erro ao criar notificação (async): {e}")
    finally:
        db.close()

def notify_message_sent(db: Session, user_id: int, ticket_id: int):
    result = ticket_crud.get_ticket(db, ticket_id)

    if result and result.assignee_id:
        if user_id == result.assignee_id:
            notification_crud.create_notification(
                db=db,
                user_id=result.requester_id,  
                ticket_id=ticket_id,
                message="Nova mensagem do tecnico. Tk:"+ str(ticket_id),
                notif_type=NotificationType.message_sent
            )
        else:
            notification_crud.create_notification(
                db=db,
                user_id=result.assignee_id,  
                ticket_id=ticket_id,
                message="Nova mensagem. Tk:"+ str(ticket_id),
                notif_type=NotificationType.message_sent
            )

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
    