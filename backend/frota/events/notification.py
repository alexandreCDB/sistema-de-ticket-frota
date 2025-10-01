import asyncio
import json
from sqlalchemy.orm import Session
from backend.frota.crud.crud_vehicle import get_vehicle
from backend.frota.models.booking import Booking
from backend.frota.models.vehicle import Vehicle
from backend.models.user import User
from backend.ticket.crud import notification as notification_crud
from backend.ticket.crud import ticket as ticket_crud
from backend.database.database import SessionLocal
from backend.ticket.models.message import Message
from backend.ticket.models.notification import Notification, NotificationType
from backend.ticket.models.ticket import Ticket
from backend.websocket.service.ws_instance import manager
from backend.frota.database import get_db , SessionLocal as FleetSessionLocal 


async def notify_frota_checkout_async(vehicle_id: int):
    # sessão para banco da frota
    db_frota = FleetSessionLocal()
    try:
        vehicle = get_vehicle(db_frota, vehicle_id)
        
        if not vehicle:
            return

        # Agora você ainda precisa de db de notifications
        db_pm = SessionLocal()  
        try:
            user_super = db_pm.query(User).filter(
                User.is_super_admin == True,
                User.is_active == True
            ).all()

            notifications = []
            for admin in user_super:
                notification = notification_crud.create_notification_frota(
                    db=db_pm,
                    user_id=admin.id,
                    vehicle_id=vehicle_id,
                    message=f"Solicitação de retirada de veículo :  {vehicle.name} - {vehicle.license_plate}",
                    notif_type=NotificationType.frota_checkout
                )
                notifications.append(notification)

            db_pm.commit()
            for notification in notifications:
                await manager.send_to_user(
                    notification.user_id,
                    "frota_checkout",
                    {
                        "id": notification.id,
                        "vehicle_id": vehicle_id,
                        "message": notification.message,
                    }
                )
        finally:
            db_pm.close()
    finally:
        db_frota.close()

async def notify_frota_approve_async(booking: Booking):           
        db_pm = SessionLocal()  
        try:
            notification = notification_crud.create_notification_frota(
                    db=db_pm,
                    user_id=booking.user_id,
                    vehicle_id=booking.vehicle_id,
                    message=f"Solicitação aceita para :  {booking.vehicle.name} - {booking.vehicle.license_plate}",
                    notif_type=NotificationType.frota_solicitation
                )
            db_pm.commit()
            
            await manager.send_to_user(
                    notification.user_id,
                    "frota_solicitation",
                    {
                        "id": notification.id,
                        "vehicle_id": booking.vehicle_id,
                        "message": notification.message,
                    }
                )
            
            
        finally:
            db_pm.close()

async def notify_frota_deny_async(booking: Booking):           
        db_pm = SessionLocal()  
        try:
            notification = notification_crud.create_notification_frota(
                    db=db_pm,
                    user_id=booking.user_id,
                    vehicle_id=booking.vehicle_id,
                    message=f"Solicitação recusada para :  {booking.vehicle.name} - {booking.vehicle.license_plate}",
                    notif_type=NotificationType.frota_solicitation
                )
            db_pm.commit()
            
            await manager.send_to_user(
                    notification.user_id,
                    "frota_solicitation",
                    {
                        "id": notification.id,
                        "vehicle_id": booking.vehicle_id,
                        "message": notification.message,
                    }
                )
            
            
        finally:
            db_pm.close()

async def notify_frota_deny_async(booking: Booking):           
        db_pm = SessionLocal()  
        try:
            notification = notification_crud.create_notification_frota(
                    db=db_pm,
                    user_id=booking.user_id,
                    vehicle_id=booking.vehicle_id,
                    message=f"Solicitação recusada para :  {booking.vehicle.name} - {booking.vehicle.license_plate}",
                    notif_type=NotificationType.frota_solicitation
                )
            db_pm.commit()
            
            await manager.send_to_user(
                    notification.user_id,
                    "frota_solicitation",
                    {
                        "id": notification.id,
                        "vehicle_id": booking.vehicle_id,
                        "message": notification.message,
                    }
                )
            
            
        finally:
            db_pm.close()

async def notify_frota_return_async(booking: Booking):
    # sessão para banco da frota
    db_frota = FleetSessionLocal()
    try:
        vehicle = get_vehicle(db_frota, booking.vehicle_id)
        
        if not vehicle:
            return

        # Agora você ainda precisa de db de notifications
        db_pm = SessionLocal()  
        try:
            user_super = db_pm.query(User).filter(
                User.is_super_admin == True,
                User.is_active == True
            ).all()

            notifications = []
            for admin in user_super:
                notification = notification_crud.create_notification_frota(
                    db=db_pm,
                    user_id=admin.id,
                    vehicle_id=booking.vehicle_id,
                    message=f"Devolução de veículo :  {vehicle.name} - {vehicle.license_plate}",
                    notif_type=NotificationType.frota_return
                )
                notifications.append(notification)

            db_pm.commit()
            for notification in notifications:
                await manager.send_to_user(
                    notification.user_id,
                    "frota_return",
                    {
                        "id": notification.id,
                        "vehicle_id": notification.vehicle_id,
                        "message": notification.message,
                    }
                )
        finally:
            db_pm.close()
    finally:
        db_frota.close()





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
