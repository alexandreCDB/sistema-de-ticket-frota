from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

PRINCIPAL_DATABASE_URL = os.getenv("PRINCIPAL_DATABASE_URL")
if not PRINCIPAL_DATABASE_URL:
    print("AVISO: PRINCIPAL_DATABASE_URL não definida no .env. Usando SQLite como fallback.")
    PRINCIPAL_DATABASE_URL = "sqlite:///./sql_app.db"

engine = create_engine(
    PRINCIPAL_DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in PRINCIPAL_DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
