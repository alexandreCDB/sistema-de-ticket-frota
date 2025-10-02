from sqlalchemy.orm import Session
from ..models.vehicle import Vehicle, VehicleStatus # ADICIONADO VehicleStatus
from ..models.booking import Booking

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

def update_vehicle(db: Session, vehicle_id: int, vehicle_data: dict):
    v = get_vehicle(db, vehicle_id)
    if not v:
        return None
    for key, value in vehicle_data.items():
        setattr(v, key, value)
    db.commit()
    db.refresh(v)
    return v

# ADICIONADO: Nova função para alterar apenas o status
def update_vehicle_status(db: Session, vehicle_id: int, status: VehicleStatus):
    vehicle = get_vehicle(db, vehicle_id)
    if vehicle:
        vehicle.status = status
        db.commit()
        db.refresh(vehicle)
    return vehicle

def delete_vehicle(db: Session, vehicle_id: int):
    v = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not v:
        return None
    
    db.query(Booking).filter(Booking.vehicle_id == vehicle_id).delete(synchronize_session=False)

    db.delete(v)
    db.commit()
    return True