from typing import List, Optional
from sqlalchemy.orm import Session
from backend.ticket.models.notification import Notification, NotificationType


def create_notification(
    db: Session,
    user_id: int,
    ticket_id: int,
    message: Optional[str] = None,
    notif_type: NotificationType = NotificationType.ticket_created
) -> Notification:
    new_notification = Notification(
        user_id=user_id,
        ticket_id=ticket_id,
        message=message,
        notification_type=notif_type
    )
    db.add(new_notification)
    db.commit()
    db.refresh(new_notification)
    return new_notification

def create_notification_frota(
    db: Session,
    user_id: int,
    vehicle_id: int,
    message: Optional[str] = None,
    notif_type: NotificationType = NotificationType.frota_checkout
) -> Notification:
    new_notification = Notification(
        user_id=user_id,
        vehicle_id=vehicle_id,
        message=message,
        notification_type=notif_type
    )
    db.add(new_notification)
    db.commit()
    db.refresh(new_notification)
    return new_notification

def mark_notification_as_read(db: Session, notification_id: int) -> Optional[Notification]:
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if notification:
        notification.is_read = True
        db.commit()
        db.refresh(notification)
    return notification


def get_unread_notifications_by_user(db: Session, user_id: int) -> List[Notification]:
    result = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).order_by(Notification.created_at.desc()).all()


    print(result)

    return result
