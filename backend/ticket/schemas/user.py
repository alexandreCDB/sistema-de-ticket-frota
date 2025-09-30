#
# Arquivo: backend/ticket/schemas/user.py
#
from datetime import datetime
from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    is_active: bool = True
    is_admin: bool = False
    is_super_admin: bool = False
    lastSeen: Optional[datetime] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None
    is_super_admin: Optional[bool] = None
    lastSeen: Optional[datetime] = None
class UserRead(UserBase):
    id: int

    class Config:
        from_attributes = True 