#
# Arquivo: backend/ticket/routers/auth_router.py (VERSÃO CORRIGIDA)
#
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from backend.database.database import get_db
from backend.crud.user import get_user_by_email
from backend.core.security import create_access_token, verify_password
from backend.models.user import User
from backend.ticket.schemas.token import Token

# --- CORREÇÃO AQUI ---
# O 'prefix="/auth"' FOI REMOVIDO DAQUI.
# O main.py agora é o único responsável por adicionar este prefixo.
router = APIRouter(tags=["auth"])

def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = get_user_by_email(db, email=email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

@router.post("/login", response_model=Token)
async def login(response: Response, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, email=form_data.username, password=form_data.password)
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Usuário ou senha inválidos/inativo")

    user.lastSeen = datetime.now()
    db.commit()  # salva no banco
    db.refresh(user) 
    access_token_expires = timedelta(hours=12)
    access_token = create_access_token(data={"sub": str(user.id)}, expires_delta=access_token_expires)

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=12*3600,
        expires=12*3600,
        secure=False,
        samesite="lax"
    )
    return {"access_token": access_token, "token_type": "bearer",   "user_e": user.email}

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"msg": "Logout realizado com sucesso"}