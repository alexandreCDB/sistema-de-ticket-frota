from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
# Assumo que este arquivo de segurança está em backend/core/security.py
# Se estiver em outro lugar, ajuste o caminho.
from backend.core.security import decode_access_token 

# --- MUDANÇAS PRINCIPAIS ---
# 1. Usa o get_db do banco de dados GLOBAL, que contém os usuários.
from backend.database.database import get_db
# 2. Usa a função get_user do CRUD GLOBAL que acabamos de criar.
from backend.crud.user import get_user
# 3. Usa o modelo SQLAlchemy User do local GLOBAL para a anotação de tipo.
from backend.models.user import User

def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    """
    Decodifica o token do cookie, busca o usuário no banco de dados principal
    e o retorna. Esta função agora é 100% global e independente de módulos.
    """
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token ausente")

    try:
        payload = decode_access_token(token)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token inválido")
    except Exception: # Captura qualquer erro de decodificação (expirado, malformado, etc)
        raise HTTPException(status_code=401, detail="Token inválido ou expirado")

    user = get_user(db, user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Usuário não encontrado ou inativo")
    return user

async def get_current_admin_user(current_user: User = Depends(get_current_user)):
    """
    Dependência que garante que o usuário logado é um admin ou super_admin.
    """
    if not (current_user.is_admin or current_user.is_super_admin):
        raise HTTPException(status_code=403, detail="Permissão insuficiente")
    return current_user

async def get_current_super_admin_user(current_user: User = Depends(get_current_user)):
    """
    Dependência que garante que o usuário logado é um super_admin.
    """
    if not current_user.is_super_admin:
        raise HTTPException(status_code=403, detail="Permissão insuficiente")
    return current_user
