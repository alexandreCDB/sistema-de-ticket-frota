from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Path
from sqlalchemy.orm import Session

from backend.frota.events.notification import notify_frota_approve_async, notify_frota_checkout_async, notify_frota_deny_async, notify_frota_return_async
# As 3 linhas abaixo foram corrigidas para usar o caminho relativo correto (..)
from ..crud.crud_booking import (
    create_checkout, create_schedule, get_bookings, approve_booking,
    deny_booking, complete_return, get_booking
)
from ..schemas.booking import BookingCheckout, BookingSchedule, BookingRead
from ..database import get_db
# A linha abaixo foi corrigida para usar o caminho absoluto global
from backend.dependencies import get_current_user

router = APIRouter()

@router.get("/", response_model=list[BookingRead])
def list_bookings(db: Session = Depends(get_db), user = Depends(get_current_user)):
    # Usando user.is_admin para verificar se é um gerente/admin
    if user.is_admin:
        return get_bookings(db)
    else:
        # devolve apenas do usuário
        bookings = get_bookings(db)
        return [b for b in bookings if b.user_id == user.id]

@router.post("/checkout", response_model=BookingRead)
def checkout(payload: BookingCheckout, background_tasks: BackgroundTasks, db: Session = Depends(get_db), user = Depends(get_current_user)):
    try:
        b = create_checkout(db, user.id, payload.vehicle_id, payload.purpose, payload.observation, payload.start_mileage)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    background_tasks.add_task(notify_frota_checkout_async, payload.vehicle_id)
    
    return b

@router.post("/schedule", response_model=BookingRead)
def schedule(payload: BookingSchedule, db: Session = Depends(get_db), user = Depends(get_current_user)):
    try:
        b = create_schedule(db, user.id, payload.vehicle_id, payload.start_time, payload.end_time, payload.purpose, payload.observation)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return b

@router.patch("/{booking_id}/approve", response_model=BookingRead)
def approve(background_tasks: BackgroundTasks, booking_id: int = Path(...), db: Session = Depends(get_db), user = Depends(get_current_user)):
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Apenas administradores podem aprovar")
    b = approve_booking(db, booking_id, user.id)
    if not b:
        raise HTTPException(status_code=404, detail="Reserva não encontrada")
    
    background_tasks.add_task(notify_frota_approve_async, b)
    return b

@router.patch("/{booking_id}/deny", response_model=BookingRead)
def deny(background_tasks: BackgroundTasks, booking_id: int = Path(...), db: Session = Depends(get_db), user = Depends(get_current_user)):
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Apenas administradores podem negar")
    b = deny_booking(db, booking_id)
    if not b:
        raise HTTPException(status_code=404, detail="Reserva não encontrada")
    background_tasks.add_task(notify_frota_deny_async, b)
    return b

@router.post("/{booking_id}/return", response_model=BookingRead)
def do_return(
    booking_id: int,
    payload: dict,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    # payload esperado: {"end_mileage": 54400, "parking_location":"G2-15"}
    end_mileage = payload.get("end_mileage")
    parking_location = payload.get("parking_location")
    b = complete_return(db, booking_id, end_mileage, parking_location)
    if not b:
        raise HTTPException(status_code=404, detail="Reserva não encontrada")
    
    background_tasks.add_task(notify_frota_return_async, b)
    return b