# backend/frota/crud/crud_booking.py
from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timezone, timedelta
from ..models.booking import Booking
from ..models.vehicle import Vehicle

# Importa banco e CRUD global
from backend.database.database import get_db as get_global_db
from backend.crud.user import get_user
from backend.models.user import User

# --- CRUD da frota ---

def create_checkout(db: Session, user_id:int, vehicle_id:int, purpose:str=None, observation:str=None, start_mileage:int=None):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).with_for_update().first()
    if not vehicle:
        raise ValueError("Vehicle not found")
    if vehicle.status not in ("available",):
        raise ValueError("Vehicle not available")
        
    now_utc = datetime.now(timezone.utc)
    
    b = Booking(
        vehicle_id=vehicle_id,
        user_id=user_id,
        type="checkout",
        status="pending",
        purpose=purpose,
        observation=observation,
        start_time=now_utc,
        start_mileage=start_mileage
    )
    
    vehicle.status = "reserved"
    
    db.add(b)
    db.commit()
    db.refresh(b)
    
    # Injeta user do banco global
    global_db = next(get_global_db())
    b.user = get_user(global_db, user_id)
    
    return b

def create_schedule(db: Session, user_id:int, vehicle_id:int, start_time, end_time, purpose=None, observation=None):
    overlap = db.query(Booking).filter(
        Booking.vehicle_id == vehicle_id,
        Booking.status.in_(["pending", "confirmed"]),
        Booking.start_time < end_time,
        (Booking.end_time == None) | (Booking.end_time > start_time)
    ).first()
    if overlap:
        raise ValueError("Vehicle already booked in this period")
        
    b = Booking(
        vehicle_id=vehicle_id,
        user_id=user_id,
        type="schedule",
        status="pending",
        purpose=purpose,
        observation=observation,
        start_time=start_time,
        end_time=end_time
    )
    
    db.add(b)
    db.commit()
    db.refresh(b)
    
    global_db = next(get_global_db())
    b.user = get_user(global_db, user_id)
    
    return b

def get_bookings(db: Session, skip:int=0, limit:int=200):
    bookings = db.query(Booking).options(joinedload(Booking.vehicle)).offset(skip).limit(limit).all()
    
    # Injeta usuário do banco global
    global_db = next(get_global_db())
    for b in bookings:
        b.user = get_user(global_db, b.user_id)
        
    return bookings

def get_booking(db: Session, booking_id:int):
    b = db.query(Booking).options(joinedload(Booking.vehicle)).filter(Booking.id == booking_id).first()
    if not b:
        return None
    global_db = next(get_global_db())
    b.user = get_user(global_db, b.user_id)
    return b

def approve_booking(db: Session, booking_id:int, approver_id:int):
    b = get_booking(db, booking_id)
    if not b:
        return None
        
    b.status = "confirmed"
    b.handled_by = approver_id
    
    v = db.query(Vehicle).filter(Vehicle.id == b.vehicle_id).first()
    if v:
        now_utc = datetime.now(timezone.utc)
        two_hours_from_now = now_utc + timedelta(hours=2)
        v.status = "reserved" if b.start_time <= two_hours_from_now else "available"
    
    db.commit()
    db.refresh(b)
    
    # Atualiza user
    global_db = next(get_global_db())
    b.user = get_user(global_db, b.user_id)
    
    return b

def deny_booking(db: Session, booking_id:int):
    b = get_booking(db, booking_id)
    if not b:
        return None
    b.status = "denied"
    
    v = db.query(Vehicle).filter(Vehicle.id == b.vehicle_id).first()
    if v:
        v.status = "available"
    
    db.commit()
    db.refresh(b)
    
    global_db = next(get_global_db())
    b.user = get_user(global_db, b.user_id)
    
    return b

def complete_return(db: Session, booking_id:int, end_mileage:int=None, parking_location:str=None):
    b = get_booking(db, booking_id)
    if not b:
        return None
    b.end_time = datetime.now(timezone.utc)
    b.end_mileage = end_mileage
    b.parking_location = parking_location
    b.status = "completed"
    
    v = db.query(Vehicle).filter(Vehicle.id == b.vehicle_id).first()
    if v:
        v.status = "available"
    
    db.commit()
    db.refresh(b)
    
    global_db = next(get_global_db())
    b.user = get_user(global_db, b.user_id)
    
    return b
