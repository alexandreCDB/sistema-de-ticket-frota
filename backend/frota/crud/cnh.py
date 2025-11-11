from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import date

# Importa o modelo User do Módulo Tickets/Geral
# Ajuste o caminho de importação se necessário. Assumimos que 'backend.models.user' é o caminho.
from backend.models.user import User 
from ..models.cnh import CnhInfoModel
from ..schemas.cnh import CnhUpdate # MANTEMOS APENAS CnhUpdate

# --- Nova Função para Listagem Cruzada ---
def get_users_and_cnh(db_ticket: Session, db_frota: Session) -> List[Dict[str, Any]]:
    """
    Busca todos os usuários (Ticket DB) e cruza com informações da CNH (Frota DB) em Python.
    Resolve o problema de JOIN entre bancos de dados distintos.
    """
    
    # 1. Busca todos os usuários do Banco de Dados de TICKET
    all_users: List[User] = db_ticket.query(User).all()

    # 2. Busca todas as informações de CNH do Banco de Dados de FROTA
    # Mapeamos para um dicionário para busca rápida (O(1) - Hash Map)
    cnh_data: Dict[int, date] = {
        info.user_id: info.cnh_vencimento
        for info in db_frota.query(CnhInfoModel.user_id, CnhInfoModel.cnh_vencimento).all()
    }

    # 3. Combina os dados (Simulação de LEFT JOIN)
    combined_list: List[Dict[str, Any]] = []
    for user in all_users:
        # Serializa o objeto User para um dicionário, adicionando os campos necessários
        user_dict = {
            "id": user.id,
            "email": user.email,
            "is_active": user.is_active,
            "is_admin": user.is_admin,
            "is_super_admin": user.is_super_admin,
            "lastSeen": user.lastSeen.isoformat() if user.lastSeen else None, # Formata datetime
            # Adiciona a CNH do dicionário de busca rápida (retorna None se não encontrar)
            "cnh_vencimento": cnh_data.get(user.id), 
        }
        
        combined_list.append(user_dict)
        
    return combined_list

# --- Função de Atualização (MANTIDA, usa apenas o Frota DB) ---
def save_cnh_vencimento(db: Session, user_id: int, cnh_data: CnhUpdate):
    """
    Cria ou atualiza a data de vencimento da CNH no Frota DB.
    """
    db_cnh = db.query(CnhInfoModel).filter(CnhInfoModel.user_id == user_id).first()
    
    if db_cnh:
        # Atualiza
        db_cnh.cnh_vencimento = cnh_data.cnh_vencimento
    else:
        # Cria
        db_cnh = CnhInfoModel(
            user_id=user_id,
            cnh_vencimento=cnh_data.cnh_vencimento
        )
        db.add(db_cnh)
        
    db.commit()
    db.refresh(db_cnh)
    return db_cnh

def is_cnh_valid(db: Session, user_id: int) -> tuple[bool, str]:
    """
    Verifica se a CNH de um usuário está cadastrada e válida.
    Retorna (True, None) se estiver válida, ou (False, motivo) caso contrário.
    """
    cnh_info = db.query(CnhInfoModel).filter(CnhInfoModel.user_id == user_id).first()

    if not cnh_info or not cnh_info.cnh_vencimento:
        return False, "CNH não cadastrada no sistema. Cadastre sua CNH para agendar ou retirar um veículo."

    # Verifica se a data de vencimento é futura (ou hoje)
    if cnh_info.cnh_vencimento < date.today():
        # CNH expirada
        return False, "CNH expirada. Atualize sua data de vencimento para prosseguir."

    # CNH válida e cadastrada
    return True, ""