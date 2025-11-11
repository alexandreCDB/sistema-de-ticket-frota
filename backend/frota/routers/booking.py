from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Path
from sqlalchemy.orm import Session
from typing import List
from backend.frota.events.notification import notify_frota_approve_async, notify_frota_checkout_async, notify_frota_deny_async, notify_frota_return_async
# --- Imports do Módulo Frota ---
from ..crud.crud_booking import (
    create_checkout, create_schedule, approve_booking, deny_booking,
    complete_return, get_booking, get_all_bookings, get_bookings_by_user
)
from ..schemas.booking import BookingCheckout, BookingSchedule, BookingRead
# Import padronizado para a base da frota
from ..database import get_db as get_frota_db

# --- Imports do Módulo Global/Ticket ---
from backend.dependencies import get_current_user
from backend.database.database import get_db as get_global_db
from backend.crud.user import get_user, get_users_by_ids
from backend.models.user import User as UserModel
from ..crud import cnh as cnh_crud

router = APIRouter(
    prefix="", # 💡 CORREÇÃO: Mude de "/" para "" (string vazia)
    # tags=... (outras configurações)
)

@router.get("/", response_model=List[BookingRead])
def list_bookings(
    frota_db: Session = Depends(get_frota_db),
    global_db: Session = Depends(get_global_db),
    current_user: UserModel = Depends(get_current_user)
):
    if current_user.is_admin:
        bookings = get_all_bookings(frota_db)
    else:
        bookings = get_bookings_by_user(frota_db, user_id=current_user.id)

    if not bookings:
        return []

    user_ids = list(set(b.user_id for b in bookings))
    users = get_users_by_ids(global_db, user_ids=user_ids)
    user_map = {user.id: user for user in users}

    for b in bookings:
        b.user = user_map.get(b.user_id)

    return bookings

@router.post("/checkout", response_model=BookingRead)
def checkout(
    payload: BookingCheckout, 
    background_tasks: BackgroundTasks,
    frota_db: Session = Depends(get_frota_db), 
    global_db: Session = Depends(get_global_db),
    current_user: UserModel = Depends(get_current_user)
):
    apto, motivo = cnh_crud.is_cnh_valid(frota_db, current_user.id)
    if not apto:
        raise HTTPException(status_code=403, detail=motivo)
    
    try:
        booking = create_checkout(frota_db, current_user.id, payload.vehicle_id, payload.purpose, payload.observation, payload.start_mileage)
        booking.user = get_user(global_db, booking.user_id) 
        
        background_tasks.add_task(notify_frota_checkout_async, payload.vehicle_id)
        return booking
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# --- Alteração no /schedule ---
@router.post("/schedule", response_model=BookingRead)
def schedule(
    payload: BookingSchedule,
    frota_db: Session = Depends(get_frota_db),
    global_db: Session = Depends(get_global_db),
    current_user: UserModel = Depends(get_current_user)
):
    apto, motivo = cnh_crud.is_cnh_valid(frota_db, current_user.id)
    if not apto:
        raise HTTPException(status_code=403, detail=motivo)

    try:
        booking = create_schedule(frota_db, current_user.id, payload.vehicle_id, payload.start_time, payload.end_time, payload.purpose, payload.observation)
        booking.user = get_user(global_db, booking.user_id)
        return booking
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{booking_id}/approve", response_model=BookingRead)
def approve(
    booking_id: int,
    
    background_tasks: BackgroundTasks,
    frota_db: Session = Depends(get_frota_db),
    global_db: Session = Depends(get_global_db),
    current_user: UserModel = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Apenas administradores podem aprovar")
    
    # VARIÁVEL CORRIGIDA
    booking = approve_booking(frota_db, booking_id, current_user.id)
    if not booking:
        raise HTTPException(status_code=404, detail="Reserva não encontrada")
    
    # LÓGICA ADICIONADA
    booking.user = get_user(global_db, booking.user_id)
    # RETORNO CORRIGIDO
     
    background_tasks.add_task(notify_frota_approve_async, booking)
    return booking

@router.patch("/{booking_id}/deny", response_model=BookingRead)
def deny(
    booking_id: int,
    background_tasks: BackgroundTasks, 
    frota_db: Session = Depends(get_frota_db),
    global_db: Session = Depends(get_global_db),
    current_user: UserModel = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Apenas administradores podem negar")
        
    # VARIÁVEL CORRIGIDA
    booking = deny_booking(frota_db, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Reserva não encontrada")
        
    # LÓGICA ADICIONADA
    booking.user = get_user(global_db, booking.user_id)
    # RETORNO CORRIGIDO
    background_tasks.add_task(notify_frota_deny_async, booking)
    return booking

@router.post("/{booking_id}/return", response_model=BookingRead)
def do_return(
    booking_id: int, 
    payload: dict,
    background_tasks: BackgroundTasks,
    # PARÂMETROS CORRIGIDOS
    frota_db: Session = Depends(get_frota_db),
    global_db: Session = Depends(get_global_db),
    current_user: UserModel = Depends(get_current_user)
):
    end_mileage = payload.get("end_mileage")
    parking_location = payload.get("parking_location")
    
    # VARIÁVEL CORRIGIDA
    booking = complete_return(frota_db, booking_id, end_mileage, parking_location)
    if not booking:
        raise HTTPException(status_code=404, detail="Reserva não encontrada")
        
    # LÓGICA ADICIONADA
    booking.user = get_user(global_db, booking.user_id)
    # RETORNO CORRIGIDO
    background_tasks.add_task(notify_frota_return_async, booking)
    return booking
