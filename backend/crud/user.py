from sqlalchemy.orm import Session
# Importa o modelo User do seu novo local global
from backend.models.user import User

def get_user(db: Session, user_id: int):
    """
    Busca um usuário pelo seu ID no banco de dados.

    Args:
        db (Session): A sessão do banco de dados.
        user_id (int): O ID do usuário a ser encontrado.

    Returns:
        User | None: O objeto do usuário se encontrado, caso contrário None.
    """
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    """
    Busca um usuário pelo seu email no banco de dados.

    Args:
        db (Session): A sessão do banco de dados.
        email (str): O email do usuário a ser encontrado.

    Returns:
        User | None: O objeto do usuário se encontrado, caso contrário None.
    """
    return db.query(User).filter(User.email == email).first()

# Você pode adicionar aqui outras funções de CRUD para o usuário que
# sejam necessárias em ambos os módulos (ticket e frota).