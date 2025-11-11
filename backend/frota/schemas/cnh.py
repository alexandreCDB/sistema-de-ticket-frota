from datetime import date
from pydantic import BaseModel
from typing import Optional

class CnhUpdate(BaseModel):
    user_id: int
    cnh_vencimento: Optional[date]

class CnhInfo(BaseModel):
    user_id: int
    cnh_vencimento: date
    
    class Config:
        orm_mode = True