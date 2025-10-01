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

