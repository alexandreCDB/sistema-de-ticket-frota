# backend/frota/schemas/vehicle.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class VehicleBase(BaseModel):
    name: str
    model: Optional[str]
    license_plate: str

class VehicleCreate(VehicleBase):
    image_url: Optional[str]
    passengers: Optional[int]
    features: Optional[str]
    monitor_fuel: Optional[bool] = False  # ✅ JÁ ADICIONADO

class VehicleRead(VehicleBase):
    id: int
    image_url: Optional[str]
    status: Optional[str]         # 👈 pode vir nulo em registros antigos ou novos
    passengers: Optional[int]
    features: Optional[str]
    monitor_fuel: Optional[bool]  # ✅ ADICIONAR ESTE CAMPO
    created_at: Optional[datetime]  # 👈 evita erro se banco não preencher antes do refresh

    class Config:
        orm_mode = True