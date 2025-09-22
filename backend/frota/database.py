import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from dotenv import load_dotenv

# Carrega as variáveis do arquivo .env
load_dotenv()

# Pega a URL de conexão específica da frota que definimos no Passo 1
FROTA_DATABASE_URL = os.getenv("FROTA_DATABASE_URL")

if not FROTA_DATABASE_URL:
    raise ValueError("A variável FROTA_DATABASE_URL não foi definida no arquivo .env")

# Cria o "motor" de conexão com o banco de dados da frota
engine = create_engine(FROTA_DATABASE_URL)

# Cria uma fábrica de sessões para interagir com o banco
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Cria uma classe Base da qual nossos modelos de tabela (Vehicle, Booking) irão herdar
Base = declarative_base()

# Função de dependência do FastAPI para obter uma sessão do banco em cada requisição
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()