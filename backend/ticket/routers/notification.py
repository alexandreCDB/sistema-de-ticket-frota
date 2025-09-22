from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.database.database import get_db
from backend.ticket.    crud import notification as notification_crud  
from backend.ticket.    schemas.notification import NotificationSchema

router = APIRouter(
    prefix="/notifications",
    tags=["notifications"],
    responses={404: {"description": "Notification or User not found"}},
)

@router.get("/unread/{user_id}", response_model=List[NotificationSchema], status_code=200)
async def get_unread_notifications(user_id: int, db: Session = Depends(get_db)):   
    return notification_crud.get_unread_notifications_by_user(db, user_id)

@router.patch("/read/{notification_id}", response_model=NotificationSchema)
def mark_as_read(notification_id: int, db: Session = Depends(get_db)):
    notification = notification_crud.mark_notification_as_read(db, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification