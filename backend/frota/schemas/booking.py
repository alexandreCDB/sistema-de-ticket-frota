# backend/frota/schemas/booking.py

from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

from .vehicle import VehicleRead

class UserRead(BaseModel):
    id: int
    email: str

    # ATUALIZADO para Pydantic v2
    model_config = ConfigDict(from_attributes=True)

class BookingBase(BaseModel):
    vehicle_id: int
    purpose: Optional[str] = None
    observation: Optional[str] = None

class BookingCheckout(BookingBase):
    start_mileage: Optional[int] = None
    start_time: Optional[datetime] = None

class BookingSchedule(BookingBase):
    start_time: datetime
    end_time: datetime

class BookingRead(BaseModel):
    id: int
    vehicle_id: int
    user_id: int
    type: str
    status: str
    purpose: Optional[str]
    observation: Optional[str]
    start_time: datetime
    end_time: Optional[datetime]
    start_mileage: Optional[int]
    end_mileage: Optional[int]
    parking_location: Optional[str]
    created_at: datetime

    user: Optional[UserRead] = None # Tornamos opcional para o caso de um usuário ser deletado
    vehicle: VehicleRead

    # ATUALIZADO para Pydantic v2
    model_config = ConfigDict(from_attributes=True)