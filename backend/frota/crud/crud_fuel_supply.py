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