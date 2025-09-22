#
# Arquivo: backend/ticket/routers/users.py
#
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.database.database import get_db
from backend.ticket.crud import user as crud_user
from backend.dependencies import get_current_user, get_current_super_admin_user

# --- MUDANÇA AQUI ---
# Importamos os schemas necessários, incluindo o nosso novo 'UserRead'.
from backend.ticket.schemas.user import UserCreate, UserUpdate, UserRead 

router = APIRouter(
    prefix="/users",
    tags=["users"],
    responses={404: {"description": "Not found"}},
)

# A rota para criar usuário continua usando UserCreate e retorna o novo UserRead
@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user_route(user: UserCreate, db: Session = Depends(get_db)):
    db_user = crud_user.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="E-mail já cadastrado"
        )
    if not user.email.endswith("@docebrinquedo.com.br"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O e-mail deve ser do domínio @docebrinquedo.com.br"
        )
    return crud_user.create_user(db=db, user=user)

# --- MUDANÇA PRINCIPAL AQUI ---
# A rota /me/ agora usa 'UserRead' como o modelo de resposta.
# Isso quebra o loop infinito de serialização.
@router.get("/me/", response_model=UserRead, tags=["users"])
async def read_users_me(current_user: UserRead = Depends(get_current_user)):
    return current_user

# As outras rotas também são atualizadas para usar UserRead nas respostas
@router.get("/", response_model=List[UserRead])
def read_users_route(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
    current_super_admin: UserRead = Depends(get_current_super_admin_user) 
):
    users = crud_user.get_users(db, skip=skip, limit=limit)
    return users

@router.get("/{user_id}", response_model=UserRead)
def read_user_route(
    user_id: int, db: Session = Depends(get_db),
    current_super_admin: UserRead = Depends(get_current_super_admin_user) 
):
    db_user = crud_user.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return db_user

@router.put("/{user_id}", response_model=UserRead)
def update_user_route(
    user_id: int, user_update: UserUpdate, db: Session = Depends(get_db),
    current_super_admin: UserRead = Depends(get_current_super_admin_user) 
):
    db_user = crud_user.update_user(db, user_id=user_id, user_update=user_update)
    if db_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return db_user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_route(
    user_id: int, db: Session = Depends(get_db),
    current_super_admin: UserRead = Depends(get_current_super_admin_user) 
):
    success = crud_user.delete_user(db, user_id=user_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return

@router.get("/assignable/", response_model=List[UserRead]) 
def get_assignable_users_route(
    db: Session = Depends(get_db),
    current_user: UserRead = Depends(get_current_user) 
):
    assignable_users = crud_user.get_assignable_users(db)
    return assignable_users