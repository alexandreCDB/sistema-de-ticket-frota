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

# --- FUNÇÃO DE ATUALIZAÇÃO (NOVA) ---
def update_vehicle(db: Session, vehicle_id: int, vehicle_data: dict):
    # Procura o veículo na base de dados
    v = get_vehicle(db, vehicle_id)
    if not v:
        return None
    
    # Atualiza cada campo do veículo com os novos dados
    for key, value in vehicle_data.items():
        setattr(v, key, value)
        
    db.commit()
    db.refresh(v)
    return v

# --- FUNÇÃO DE EXCLUSÃO (NOVA) ---
def delete_vehicle(db: Session, vehicle_id: int):
    v = get_vehicle(db, vehicle_id)
    if not v:
        return None # Retorna None se o veículo não for encontrado
    
    db.delete(v)
    db.commit()
    return True # Retorna True em caso de sucesso