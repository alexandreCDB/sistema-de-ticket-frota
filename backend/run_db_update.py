# run_db_update.py
import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from backend.database.database import drop_all_tables, create_all_tables
from backend.models import ticket, user, message 

drop_all_tables() 

create_all_tables()
print("Banco de dados atualizado com a nova estrutura.")