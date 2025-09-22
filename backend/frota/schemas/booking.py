# backend/frota/schemas/booking.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BookingBase(BaseModel):
    vehicle_id: int
    purpose: Optional[str]
    observation: Optional[str]

class BookingCheckout(BookingBase):
    start_mileage: Optional[int]

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

    class Config:
        orm_mode = True
