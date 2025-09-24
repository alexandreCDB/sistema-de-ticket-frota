# backend/frota/crud/crud_booking.py
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone # Importe o 'timezone'
from ..models.booking import Booking
from ..models.vehicle import Vehicle

def create_checkout(db: Session, user_id:int, vehicle_id:int, purpose:str=None, observation:str=None, start_mileage:int=None):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).with_for_update().first()
    if not vehicle:
        raise ValueError("Vehicle not found")
    if vehicle.status not in ("available",):
        raise ValueError("Vehicle not available")
        
    # Use timezone.utc para tornar o datetime ciente do fuso horário
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
    return b

def create_schedule(db: Session, user_id:int, vehicle_id:int, start_time, end_time, purpose=None, observation=None):
    # check overlap with confirmed/pending bookings for same vehicle
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
    return b

def get_bookings(db: Session, skip:int=0, limit:int=200):
    return db.query(Booking).offset(skip).limit(limit).all()

def get_booking(db: Session, booking_id:int):
    return db.query(Booking).filter(Booking.id == booking_id).first()

def approve_booking(db: Session, booking_id:int, approver_id:int):
    b = get_booking(db, booking_id)
    if not b:
        return None
        
    b.status = "confirmed"
    b.handled_by = approver_id
    
    v = db.query(Vehicle).filter(Vehicle.id == b.vehicle_id).first()
    if not v:
        db.commit()
        db.refresh(b)
        return b
        
    # CORREÇÃO: use datetime.now(timezone.utc) para garantir que a comparação seja válida
    now_utc = datetime.now(timezone.utc)
    two_hours_from_now = now_utc + timedelta(hours=2)

    # Lógica de negócio: o status do veículo só muda se for para agora
    if b.start_time.replace(tzinfo=timezone.utc) <= two_hours_from_now:
        v.status = "reserved"
    else:
        v.status = "available"
    
    db.commit()
    db.refresh(b)
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
    return b