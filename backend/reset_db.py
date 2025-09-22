# reset_db.py
from .database.database import drop_all_tables, create_all_tables
from backend.models import message,notification,ticket,user  # Importa todos os seus modelos para que o Base.metadata saiba quais tabelas criar

if __name__ == "__main__":
    print("Iniciando a limpeza e recriação do banco de dados...")
    
    # 1. Remove todas as tabelas existentes
    drop_all_tables()
    
    # 2. Cria todas as tabelas novamente com base nos seus modelos
    create_all_tables()
    
    print("Banco de dados resetado com sucesso! Agora está vazio.")