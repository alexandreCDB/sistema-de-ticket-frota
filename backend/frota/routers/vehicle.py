from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..crud import crud_vehicle
from ..schemas import vehicle as vehicle_schema
from ..database import get_db
from backend.dependencies import get_current_user
from ..models.vehicle import VehicleStatus
from backend.frota.events.notification import broadcast_vehicle_update

router = APIRouter(
    prefix="", # 🚨 CORREÇÃO CRÍTICA: AGORA ESTÁ VAZIO ("")
    tags=["Vehicles"]
)

# ADICIONADO: Schema para o corpo da requisição de mudança de status
class VehicleStatusUpdate(BaseModel):
    status: VehicleStatus

# --- LISTAR, OBTER, CRIAR, ATUALIZAR, EXCLUIR ---

# 🚨 CORREÇÃO: O endpoint de listagem agora é "" (vazio).
# Rota final: /api/frota/vehicles
@router.get("", response_model=list[vehicle_schema.VehicleRead])
def list_vehicles(db: Session = Depends(get_db)):
    return crud_vehicle.get_vehicles(db)

@router.get("/{vehicle_id}", response_model=vehicle_schema.VehicleRead)
def get_one(vehicle_id: int, db: Session = Depends(get_db)):
    v = crud_vehicle.get_vehicle(db, vehicle_id)
    if not v:
        raise HTTPException(status_code=404, detail="Veículo não encontrado")
    return v

# 🚨 CORREÇÃO: O endpoint de criação agora é "" (vazio).
# Rota final: /api/frota/vehicles
@router.post("", response_model=vehicle_schema.VehicleRead)
def post_vehicle(data: vehicle_schema.VehicleCreate, db: Session = Depends(get_db), user = Depends(get_current_user)):
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Apenas administradores podem criar veículos")
    v = crud_vehicle.create_vehicle(db, data.dict())
    return v

@router.put("/{vehicle_id}", response_model=vehicle_schema.VehicleRead)
def update_one_vehicle(
    vehicle_id: int, 
    data: vehicle_schema.VehicleCreate, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db), 
    user = Depends(get_current_user)
):
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Apenas administradores podem editar veículos")
    v = crud_vehicle.update_vehicle(db, vehicle_id, data.dict())
    if not v:
        raise HTTPException(status_code=404, detail="Veículo não encontrado")
    
    background_tasks.add_task(broadcast_vehicle_update)
    return v

# --- ADICIONADO: Nova rota para alterar o status ---
@router.patch("/{vehicle_id}/status", response_model=vehicle_schema.VehicleRead)
def update_status(
    vehicle_id: int,
    payload: VehicleStatusUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Apenas administradores podem alterar o status")
    
    vehicle = crud_vehicle.update_vehicle_status(db, vehicle_id=vehicle_id, status=payload.status)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Veículo não encontrado para atualizar status")
    
    background_tasks.add_task(broadcast_vehicle_update)
    return vehicle

@router.delete("/{vehicle_id}", status_code=200)
def delete_one_vehicle(vehicle_id: int, db: Session = Depends(get_db), user = Depends(get_current_user)):
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Apenas administradores podem remover veículos")
    try:
        success = crud_vehicle.delete_vehicle(db, vehicle_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if success is None:
        raise HTTPException(status_code=404, detail="Veículo não encontrado")
    return {"detail": "Veículo excluído com sucesso"}
