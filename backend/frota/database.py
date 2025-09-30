import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from dotenv import load_dotenv

load_dotenv()

FROTA_DATABASE_URL = os.getenv("FROTA_DATABASE_URL")
if not FROTA_DATABASE_URL:
    raise ValueError("A variável FROTA_DATABASE_URL não foi definida no .env")

engine = create_engine(FROTA_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
