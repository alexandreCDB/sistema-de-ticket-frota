# backend/frota/schemas/vehicle.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class VehicleBase(BaseModel):
    name: str
    model: Optional[str]
    license_plate: str
    categories: Optional[str] = None

class VehicleCreate(VehicleBase):
    image_url: Optional[str]
    passengers: Optional[int]
    features: Optional[str]
    monitor_fuel: Optional[bool] = False  # ✅ JÁ ADICIONADO

class VehicleRead(VehicleBase):
    id: int
    image_url: Optional[str] = None
    status: Optional[str] = None
    passengers: Optional[int] = None
    features: Optional[str] = None
    monitor_fuel: Optional[bool] = None
    created_at: Optional[datetime] = None

    class Config:
        orm_mode = True