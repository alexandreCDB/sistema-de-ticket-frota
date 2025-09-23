from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..crud import crud_vehicle
from ..schemas import vehicle as vehicle_schema
from ..database import get_db
from backend.dependencies import get_current_user

router = APIRouter(
    prefix="",  # prefix será definido no main.py
    tags=["Vehicles"]
)

# --- LISTAR TODOS OS VEÍCULOS ---
@router.get("/", response_model=list[vehicle_schema.VehicleRead])
def list_vehicles(db: Session = Depends(get_db)):
    return crud_vehicle.get_vehicles(db)

# --- OBTER UM VEÍCULO PELO ID ---
@router.get("/{vehicle_id}", response_model=vehicle_schema.VehicleRead)
def get_one(vehicle_id: int, db: Session = Depends(get_db)):
    v = crud_vehicle.get_vehicle(db, vehicle_id)
    if not v:
        raise HTTPException(status_code=404, detail="Veículo não encontrado")
    return v

# --- CRIAR VEÍCULO (somente admin) ---
@router.post("/", response_model=vehicle_schema.VehicleRead)
def post_vehicle(
    data: vehicle_schema.VehicleCreate,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Apenas administradores podem criar veículos")
    v = crud_vehicle.create_vehicle(db, data.dict())
    return v
