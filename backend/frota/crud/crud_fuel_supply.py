# backend/frota/crud/crud_fuel_supply.py
from sqlalchemy.orm import Session, joinedload
from ..models.fuel_supply import FuelSupply
from ..models.vehicle import Vehicle

def get_all_fuel_supplies(db: Session, skip: int = 0, limit: int = 100):
    # Buscar supplies com vehicle
    supplies = db.query(FuelSupply).options(
        joinedload(FuelSupply.vehicle)
    ).offset(skip).limit(limit).all()
    
    # ✅ ADICIONAR: Buscar dados do usuário do banco de tickets
    try:
        from backend.database.database import get_db as get_tickets_db
        from backend.models.user import User as TicketUser
        
        tickets_db = next(get_tickets_db())
        
        for supply in supplies:
            user = tickets_db.query(TicketUser).filter(TicketUser.id == supply.user_id).first()
            if user:
                # Adicionar dados do usuário ao objeto supply
                supply.user_data = {
                    'email': user.email,
                    'name': getattr(user, 'name', user.email.split('@')[0])  # fallback para nome
                }
            else:
                supply.user_data = {'email': 'Usuário não encontrado', 'name': 'N/A'}
                
    except Exception as e:
        print(f"❌ Erro ao buscar dados do usuário: {e}")
        # Se der erro, pelo menos colocar um placeholder
        for supply in supplies:
            supply.user_data = {'email': f'user_{supply.user_id}', 'name': 'N/A'}
    
    return supplies

def create_fuel_supply(db: Session, data: dict):
    db_obj = FuelSupply(**data)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    
    # ✅ Populate user_data so pydantic schema doesn't fail
    _populate_user_data([db_obj])
    
    return db_obj

def get_fuel_supplies_by_vehicle(db: Session, vehicle_id: int, skip: int = 0, limit: int = 100):
    supplies = db.query(FuelSupply).filter(
        FuelSupply.vehicle_id == vehicle_id
    ).options(joinedload(FuelSupply.vehicle)).offset(skip).limit(limit).all()
    
    # Processar user_data (poderia ser refatorado para evitar duplicação, mas mantendo simples)
    _populate_user_data(supplies)
    return supplies

def get_fuel_supplies_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    supplies = db.query(FuelSupply).filter(
        FuelSupply.user_id == user_id
    ).options(joinedload(FuelSupply.vehicle)).offset(skip).limit(limit).all()
    
    _populate_user_data(supplies)
    return supplies

def get_fuel_supply(db: Session, fuel_supply_id: int):
    supply = db.query(FuelSupply).filter(FuelSupply.id == fuel_supply_id).options(joinedload(FuelSupply.vehicle)).first()
    if supply:
        _populate_user_data([supply])
    return supply

def delete_fuel_supply(db: Session, fuel_supply_id: int):
    obj = db.query(FuelSupply).filter(FuelSupply.id == fuel_supply_id).first()
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True

# Helper para popular user_data
def _populate_user_data(supplies):
    try:
        from backend.database.database import get_db as get_tickets_db
        from backend.models.user import User as TicketUser
        
        # Evitar criar session se lista vazia
        if not supplies:
            return

        tickets_db = next(get_tickets_db())
        
        # Otimização: buscar todos user_ids de uma vez
        user_ids = list(set(s.user_id for s in supplies))
        users = tickets_db.query(TicketUser).filter(TicketUser.id.in_(user_ids)).all()
        user_map = {u.id: u for u in users}
        
        for supply in supplies:
            user = user_map.get(supply.user_id)
            if user:
                supply.user_data = {
                    'email': user.email,
                    'name': getattr(user, 'name', user.email.split('@')[0])
                }
            else:
                supply.user_data = {'email': 'Usuário não encontrado', 'name': 'N/A'}
                
    except Exception as e:
        print(f"❌ Erro ao buscar dados do usuário: {e}")
        for supply in supplies:
            if not hasattr(supply, 'user_data'):
                supply.user_data = {'email': f'user_{supply.user_id}', 'name': 'N/A'}