from sqlalchemy.orm import Session
from backend.models.user import User
from backend.ticket.schemas.user import UserCreate, UserUpdate
from passlib.context import CryptContext
from datetime import datetime

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    is_admin = user.is_admin
    is_super_admin = user.is_super_admin
    if is_super_admin:
        is_admin = True

    db_user = User(
        email=user.email,
        hashed_password=hashed_password,
        is_active=user.is_active,
        is_admin=is_admin,
        is_super_admin=is_super_admin
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update: UserUpdate):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        return None
    update_data = user_update.model_dump(exclude_unset=True)
    if "password" in update_data:
        db_user.hashed_password = get_password_hash(update_data.pop("password"))

    if "is_super_admin" in update_data and update_data["is_super_admin"]:
        if "is_admin" in update_data and not update_data["is_admin"]:
            update_data["is_admin"] = True
        elif "is_admin" not in update_data:
            db_user.is_admin = True

    if "is_admin" in update_data and not update_data["is_admin"]:
        update_data["is_super_admin"] = False

    for key, value in update_data.items():
        if key != "hashed_password":
            setattr(db_user, key, value)

    db_user.updated_at = datetime.now()
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
        return True
    return False

def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user
def get_users(db: Session, skip: int = 0, limit: int = 100):
    """
    Retorna todos os usuários com paginação opcional.
    """
    return db.query(User).offset(skip).limit(limit).all()


def get_assignable_users(db: Session):
    """
    Retorna apenas usuários que podem ser atribuídos a tickets.
    Inclui técnicos (is_admin=True) e super admins (is_super_admin=True).
    """
    return db.query(User).filter(User.is_admin == True).all()
