# backend/crud/user.py

from sqlalchemy.orm import Session
from typing import List
# Importa o modelo User do seu novo local global
from backend.models.user import User

def get_user(db: Session, user_id: int) -> User | None:
    """
    Busca um usuário pelo seu ID no banco de dados.
    """
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> User | None:
    """
    Busca um usuário pelo seu email no banco de dados.
    """
    return db.query(User).filter(User.email == email).first()

# NOVA FUNÇÃO ADICIONADA PARA OTIMIZAÇÃO
def get_users_by_ids(db: Session, user_ids: List[int]) -> List[User]:
    """
    Busca múltiplos usuários por uma lista de IDs em uma única consulta.
    """
    if not user_ids:
        return []
    return db.query(User).filter(User.id.in_(user_ids)).all()