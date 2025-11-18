# backend/frota/schemas/fuel_supply.py
from pydantic import BaseModel
from typing import Optional
from datetime import date, time, datetime
from .vehicle import VehicleRead

class FuelSupplyBase(BaseModel):
    vehicle_id: int
    user_id: int
    
    # Dados de Saída
    departure_date: date
    departure_time: time
    departure_km: int
    departure_amount: float
    
    # Dados de Retorno
    return_date: date
    return_time: time
    return_km: int
    return_amount: float

class FuelSupplyCreate(FuelSupplyBase):
    pass

class FuelSupplyRead(FuelSupplyBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]
    vehicle: Optional[VehicleRead]
    user_data: Optional[dict]  # ✅ ADICIONAR DADOS DO USUÁRIO
    
    class Config:
        orm_mode = True