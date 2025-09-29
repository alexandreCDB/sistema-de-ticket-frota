# backend/schemas/token.py
from pydantic import BaseModel

class Token(BaseModel): # <-- Verifique se o nome da classe é "Token" com 'T' maiúsculo
    access_token: str
    token_type: str
    user_e:str

class TokenData(BaseModel):
    id: int | None = None
