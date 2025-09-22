from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

# MUDANÇA PRINCIPAL: Agora ele lê a URL completa do banco principal do .env
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

# As funções de drop/create continuam aqui, mas não serão chamadas pelo main.py
def create_all_tables():
    print("Criando tabelas no banco principal...")
    Base.metadata.create_all(bind=engine)
    print("Tabelas criadas.")