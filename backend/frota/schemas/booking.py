# backend/frota/schemas/booking.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# --- Usuário que será retornado junto com o booking ---
class UserRead(BaseModel):
    id: int
    email: str

    class Config:
        from_attributes = True  # Substitui orm_mode do Pydantic v1

# --- Base do booking ---
class BookingBase(BaseModel):
    vehicle_id: int
    purpose: Optional[str]
    observation: Optional[str]

# --- Para criação de checkout ---
class BookingCheckout(BookingBase):
    start_mileage: Optional[int]

# --- Para criação de agendamento/schedule ---
class BookingSchedule(BookingBase):
    start_time: datetime
    end_time: datetime

# --- Schema de leitura do booking ---
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
    user: UserRead  # Aqui o usuário completo vem junto

    class Config:
        from_attributes = True
