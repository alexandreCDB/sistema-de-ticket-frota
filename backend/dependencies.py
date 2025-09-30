from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from backend.core.security import decode_access_token
from backend.database.database import get_db  # banco principal
from backend.crud.user import get_user
from backend.models.user import User

def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token ausente")

    try:
        payload = decode_access_token(token)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token inválido")
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado")

    user = get_user(db, user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Usuário não encontrado ou inativo")
    return user

async def get_current_admin_user(current_user: User = Depends(get_current_user)):
    if not (current_user.is_admin or current_user.is_super_admin):
        raise HTTPException(status_code=403, detail="Permissão insuficiente")
    return current_user

async def get_current_super_admin_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_super_admin:
        raise HTTPException(status_code=403, detail="Permissão insuficiente")
    return current_user
