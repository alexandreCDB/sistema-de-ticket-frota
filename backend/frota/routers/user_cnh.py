from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date
from typing import List, Dict, Any, Union

# Dependências: get_db (Frota DB) e get_admin
from backend.dependencies import get_current_admin_user 
# Ajuste o caminho de importação se necessário. Assumindo que 'backend.frota.database' é o caminho para o Frota DB.
from backend.frota.database import get_db
# Importa a dependência do banco de dados de Tickets/Principal
from backend.database.database import get_db as get_db_ticket 

from ..schemas.cnh import CnhUpdate
from ..crud import cnh as cnh_crud 

router = APIRouter(
    prefix="",
    tags=["frota-admin-cnh"],
    dependencies=[Depends(get_current_admin_user)] 
)

# A rota de listagem (GET) agora será a raiz do prefixo definido no main.py (Ex: /api/frotas/admin/users)
@router.get("/list", response_model=List[Any])
def get_all_users_with_cnh(
    db_frota: Session = Depends(get_db), 
    db_ticket: Session = Depends(get_db_ticket) 
):
    """
    Retorna todos os usuários (do Ticket DB) combinados com a data de vencimento da CNH (do Frota DB).
    """
    users_data = cnh_crud.get_users_and_cnh(db_ticket, db_frota)
    return users_data


@router.put("/", response_model=Dict[str, Union[int, str, date]])
def update_cnh_vencimento(
    cnh_data: CnhUpdate, # Recebe user_id e cnh_vencimento no corpo
    db: Session = Depends(get_db) # Usa apenas o Frota DB para salvar
):
    """
    Atualiza a data de vencimento da CNH de um usuário.
    """
    try:
        # Passamos o user_id do corpo do CnhUpdate para o CRUD
        db_cnh = cnh_crud.save_cnh_vencimento(db, user_id=cnh_data.user_id, cnh_data=cnh_data)
        
        return {
            "user_id": db_cnh.user_id, 
            "cnh_vencimento": db_cnh.cnh_vencimento, 
            "message": "Data de vencimento da CNH atualizada com sucesso."
        }
    except Exception as e:
        print(f"ERRO INTERNO AO SALVAR CNH: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao salvar o vencimento da CNH."
        )
