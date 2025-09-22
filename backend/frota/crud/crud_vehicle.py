# backend/frota/crud/crud_vehicle.py
from sqlalchemy.orm import Session
from ..models.vehicle import Vehicle

def get_vehicle(db: Session, vehicle_id: int):
    return db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()

def get_vehicles(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Vehicle).offset(skip).limit(limit).all()

def create_vehicle(db: Session, vehicle_data: dict):
    v = Vehicle(**vehicle_data)
    db.add(v)
    db.commit()
    db.refresh(v)
    return v

def update_vehicle_status(db: Session, vehicle_id: int, status: str):
    v = get_vehicle(db, vehicle_id)
    if not v:
        return None
    v.status = status
    db.commit()
    db.refresh(v)
    return v
