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

class VehicleRead(VehicleBase):
    id: int
    image_url: Optional[str]
    status: str
    passengers: Optional[int]
    features: Optional[str]
    created_at: datetime

    class Config:
        orm_mode = True
