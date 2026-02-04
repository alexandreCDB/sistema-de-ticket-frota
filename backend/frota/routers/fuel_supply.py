# backend/frota/routers/fuel_supply.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..crud import crud_fuel_supply
from ..schemas import fuel_supply as fuel_supply_schema
from ..database import get_db
from backend.dependencies import get_current_user

router = APIRouter(
    prefix="/fuel-supplies",
    tags=["Fuel Supplies"]
)

# Criar novo abastecimento
@router.post("", response_model=fuel_supply_schema.FuelSupplyRead)
def create_fuel_supply(
    data: fuel_supply_schema.FuelSupplyCreate,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    # Verificar se o usuário está autenticado
    if not user:
        raise HTTPException(status_code=401, detail="Usuário não autenticado")
    
    # Adicionar o user_id do usuário autenticado
    fuel_supply_data = data.dict()
    fuel_supply_data['user_id'] = user.id
    
    # Validar KM (retorno deve ser maior que saída)
    if fuel_supply_data['return_km'] <= fuel_supply_data['departure_km']:
        raise HTTPException(
            status_code=400, 
            detail="KM de retorno deve ser maior que KM de saída"
        )
    
    
    result = crud_fuel_supply.create_fuel_supply(db, fuel_supply_data)
    print(f"✅ [DEBUG] Fuel Supply Created: ID={result.id}")
    print(f"✅ [DEBUG] user_data on object: {getattr(result, 'user_data', 'MISSING')}")
    return result

# Listar todos os abastecimentos (admin)
@router.get("", response_model=list[fuel_supply_schema.FuelSupplyRead])
def list_all_fuel_supplies(
    db: Session = Depends(get_db),
    user = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100
):
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Apenas administradores podem ver todos os abastecimentos")
    
    supplies = crud_fuel_supply.get_all_fuel_supplies(db, skip=skip, limit=limit)
    
    # ✅ ADICIONAR ESTE RETURN QUE ESTAVA FALTANDO!
    return supplies
    
    
 
# Listar abastecimentos de um veículo específico
@router.get("/vehicle/{vehicle_id}", response_model=list[fuel_supply_schema.FuelSupplyRead])
def list_fuel_supplies_by_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100
):
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Apenas administradores podem ver abastecimentos de veículos")
    
    return crud_fuel_supply.get_fuel_supplies_by_vehicle(db, vehicle_id, skip=skip, limit=limit)

# Listar abastecimentos do usuário atual
@router.get("/my-supplies", response_model=list[fuel_supply_schema.FuelSupplyRead])
def list_my_fuel_supplies(
    db: Session = Depends(get_db),
    user = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100
):
    return crud_fuel_supply.get_fuel_supplies_by_user(db, user.id, skip=skip, limit=limit)

# Obter um abastecimento específico
@router.get("/{fuel_supply_id}", response_model=fuel_supply_schema.FuelSupplyRead)
def get_fuel_supply(
    fuel_supply_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    fuel_supply = crud_fuel_supply.get_fuel_supply(db, fuel_supply_id)
    if not fuel_supply:
        raise HTTPException(status_code=404, detail="Abastecimento não encontrado")
    
    # Usuário só pode ver seus próprios abastecimentos, a menos que seja admin
    if not user.is_admin and fuel_supply.user_id != user.id:
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    return fuel_supply

# Deletar abastecimento
@router.delete("/{fuel_supply_id}")
def delete_fuel_supply(
    fuel_supply_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Apenas administradores podem excluir abastecimentos")
    
    success = crud_fuel_supply.delete_fuel_supply(db, fuel_supply_id)
    if not success:
        raise HTTPException(status_code=404, detail="Abastecimento não encontrado")
    
    return {"detail": "Abastecimento excluído com sucesso"}

# ✅ ROTA DE TESTE - NO FINAL DO ARQUIVO
@router.get("/test")
def test_route():
    return {"message": "✅ Rota fuel-supplies funcionando!"}