from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timezone, timedelta

from ..models.booking import Booking
from ..models.vehicle import Vehicle

def create_checkout(db: Session, user_id:int, vehicle_id:int, purpose:str=None, observation:str=None, start_mileage:int=None, start_time: datetime = None):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).with_for_update().first()
    if not vehicle:
        raise ValueError("Veículo não encontrado")
    if vehicle.status not in ("available",):
        raise ValueError("Veículo não disponível")
        
    now_utc = datetime.now(timezone.utc)
    
    b = Booking(
        vehicle_id=vehicle_id,
        user_id=user_id,
        type="checkout",
        status="pending",
        purpose=purpose,
        observation=observation,
        start_time=start_time or now_utc,
        start_mileage=start_mileage
    )
    
    # Status permanece available até ser aceito
    # vehicle.status = "reserved"
    
    db.add(b)
    db.commit()
    db.refresh(b)
    
    # CORRIGIDO: Removidas as linhas que acessavam o banco de dados global.
    # A função agora retorna o objeto puro, como as outras funções neste arquivo.
    return b

def create_schedule(db: Session, user_id:int, vehicle_id:int, start_time: datetime, end_time: datetime, purpose:str=None, observation:str=None):
    overlap = db.query(Booking).filter(
        Booking.vehicle_id == vehicle_id,
        Booking.status.in_(["pending", "confirmed", "in-use"]),
        Booking.start_time < end_time,
        Booking.end_time > start_time
    ).first()
    if overlap:
        raise ValueError("Veículo já reservado neste período")
        
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

def get_booking(db: Session, booking_id:int):
    return db.query(Booking).options(joinedload(Booking.vehicle)).filter(Booking.id == booking_id).first()

def get_all_bookings(db: Session):
    return db.query(Booking).options(joinedload(Booking.vehicle)).order_by(Booking.created_at.desc()).all()

def get_bookings_by_user(db: Session, user_id: int):
    return db.query(Booking).options(joinedload(Booking.vehicle)).filter(Booking.user_id == user_id).order_by(Booking.created_at.desc()).all()

def approve_booking(db: Session, booking_id:int, approver_id:int):
    b = get_booking(db, booking_id)
    if not b:
        return None
        
    b.status = "confirmed"
    b.handled_by = approver_id
    
    if b.vehicle:
        now_utc = datetime.now(timezone.utc)
        
        # Regras: 30 minutos para retirada imediata (checkout), 1 hora para agendamento
        limit_time = now_utc + (timedelta(minutes=30) if b.type == "checkout" else timedelta(hours=1))
        
        if b.start_time <= limit_time:
            b.vehicle.status = "in-use"
        else:
            b.vehicle.status = "available"

    db.commit()
    db.refresh(b)
    return b

def deny_booking(db: Session, booking_id:int):
    b = get_booking(db, booking_id)
    if not b:
        return None
    b.status = "denied"
    
    if b.vehicle:
        b.vehicle.status = "available"
    
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
    
    if b.vehicle:
        b.vehicle.status = "available"
    
    db.commit()
    db.refresh(b)
    return b