import asyncio
import json
import os
import shutil
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from fastapi import HTTPException, UploadFile
from backend.ticket.events.notification import notify_ticket_created, notify_ticket_created_async, notify_ticket_wsb_async
from backend.ticket.events.notification import notify_ticket_accept
from backend.ticket.events.notification import notify_ticket_close
from backend.ticket.models.notification import NotificationType
from backend.ticket.models.ticket import Ticket, TicketStatus
from backend.models.user import User
from backend.ticket.schemas.ticket import TicketCreate, TicketUpdate
from datetime import datetime
from typing import Optional, List


# --- Funções auxiliares para upload ---
def _save_upload_file(upload_file: UploadFile) -> str:
    """Salva o arquivo enviado para o diretório de uploads e retorna o caminho."""
    # Define o diretório de uploads. 
    # __file__ é o caminho deste arquivo (crud/ticket.py).
    # "..", "..", "uploads" sobe dois níveis para a raiz do projeto e entra na pasta 'uploads'.
    UPLOAD_DIRECTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "uploads")
    
    # Cria o diretório se não existir
    os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)

    # Gera um nome de arquivo único para evitar colisões
    file_extension = os.path.splitext(upload_file.filename)[1]
    # Usamos o timestamp atual e o nome original do arquivo (com espaços substituídos por underscores)
    unique_filename = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{upload_file.filename.replace(' ', '_')}" 
    file_path = os.path.join(UPLOAD_DIRECTORY, unique_filename)

    try:
        with open(file_path, "wb") as buffer:
            # Copia o conteúdo do arquivo enviado para o arquivo local
            shutil.copyfileobj(upload_file.file, buffer)
    except Exception as e:
        # Lidar com possíveis erros de escrita de arquivo
        raise HTTPException(status_code=500, detail=f"Falha ao salvar o anexo no disco: {e}")
    
    # Retorna o caminho relativo ou URL que o frontend usará.
    # O FastAPI serve o diretório '/uploads' estaticamente, então a URL é '/uploads/nome_do_arquivo'.
    return f"/uploads/{unique_filename}"

def _delete_attachment_file(file_url: str):
    """Deleta o arquivo anexo do sistema de arquivos com base na URL."""
    if not file_url:
        return

    UPLOAD_DIRECTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "uploads")
    
    # Extrai o nome do arquivo da URL (ex: /uploads/meu_arquivo.png -> meu_arquivo.png)
    filename = os.path.basename(file_url)
    file_path = os.path.join(UPLOAD_DIRECTORY, filename)

    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except OSError as e:
            print(f"Erro ao deletar o arquivo {file_path}: {e}")
    else:
        print(f"Aviso: Arquivo de anexo não encontrado para exclusão: {file_path}")


# --- Funções CRUD para Ticket ---

def get_ticket(db: Session, ticket_id: int):
    return db.query(Ticket)\
             .options(joinedload(Ticket.requester))\
             .options(joinedload(Ticket.assignee))\
             .filter(Ticket.id == ticket_id).first()

def get_tickets(
    db: Session, 
    current_user: User, 
    requester_id: Optional[int] = None, 
    status: Optional[List[TicketStatus]] = None, 
    skip: int = 0, 
    limit: int = 100
):
    query = db.query(Ticket)

    if requester_id:
        query = query.filter(Ticket.requester_id == requester_id)
    
    if status:
        status_values = [s.value for s in status]
        query = query.filter(Ticket.status.in_(status_values))
    
    total_tickets = query.count()
    
    tickets_paginated = query.order_by(Ticket.created_at.desc())\
                             .options(joinedload(Ticket.requester))\
                             .options(joinedload(Ticket.assignee))\
                             .offset(skip).limit(limit).all()
    
    return tickets_paginated, total_tickets

def get_assigned_and_unassigned_tickets(
    db: Session, 
    current_user: User, 
    status: Optional[List[TicketStatus]] = None,
    include_closed_or_resolved: bool = False,
    skip: int = 0, 
    limit: int = 100
):
    query = db.query(Ticket)

    if status:
        status_values = [s.value for s in status]
        query = query.filter(Ticket.status.in_(status_values))
    
    if not include_closed_or_resolved:
        query = query.filter(Ticket.status.notin_([TicketStatus.closed.value, TicketStatus.resolved.value, TicketStatus.cancelled.value]))

    if current_user.is_admin:
        query = query.filter(or_(
            Ticket.assignee_id == current_user.id,
            Ticket.assignee_id == None
        ))
    elif not current_user.is_super_admin:
        return [], 0 

    total_tickets = query.count()

    tickets_paginated = query.order_by(Ticket.created_at.desc())\
                             .options(joinedload(Ticket.requester))\
                             .options(joinedload(Ticket.assignee))\
                             .offset(skip).limit(limit).all()

    return tickets_paginated, total_tickets

def get_all_tickets(
    db: Session, 
    status: Optional[List[TicketStatus]] = None,
    include_closed_or_resolved: bool = False,
    skip: int = 0, 
    limit: int = 100
):
    query = db.query(Ticket)

    if status:
        status_values = [s.value for s in status]
        query = query.filter(Ticket.status.in_(status_values))
    
    if not include_closed_or_resolved:
        query = query.filter(Ticket.status.notin_([TicketStatus.closed.value, TicketStatus.resolved.value, TicketStatus.cancelled.value]))

    total_tickets = query.count()

    tickets_paginated = query.order_by(Ticket.created_at.desc())\
                             .options(joinedload(Ticket.requester))\
                             .options(joinedload(Ticket.assignee))\
                             .offset(skip).limit(limit).all()
                             
    return tickets_paginated, total_tickets


def create_ticket(db: Session, ticket_data: TicketCreate, requester_id: int, attachment: Optional[UploadFile] = None):
    initial_status = TicketStatus.open.value
   
    # Validação do ID do técnico, permitindo que qualquer usuário o defina
    if ticket_data.assignee_id:
        assignee_user = db.query(User).filter(User.id == ticket_data.assignee_id).first()
        if not assignee_user or not (assignee_user.is_admin or assignee_user.is_super_admin):
            raise ValueError("ID de atribuidor inválido. O atribuidor deve ser um usuário técnico (Admin) ou um SuperAdmin existente.")
    
    attachment_url = None
    if attachment:
        try:
            attachment_url = _save_upload_file(attachment)
        except HTTPException as e:
            # Se a função de salvar arquivo já lançar HTTPException, repasse-a
            raise e
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Erro inesperado ao salvar o anexo: {e}")

    db_ticket = Ticket(
        title=ticket_data.title,
        description=ticket_data.description,
        category=ticket_data.category,
        priority=ticket_data.priority,
        status=initial_status,
        requester_id=requester_id,
        assignee_id=ticket_data.assignee_id,
        attachment_url=attachment_url # Salva a URL do anexo no banco de dados
    )
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    
    # Recarrega o ticket para incluir os objetos de relacionamento completos para a resposta
    db_ticket = db.query(Ticket)\
                    .options(joinedload(Ticket.requester))\
                    .options(joinedload(Ticket.assignee))\
                    .filter(Ticket.id == db_ticket.id).first()
    
    # [AJUSTE AQUI] Notifica apenas o técnico atribuído, se houver.
    # O código anterior tinha a notificação do solicitante comentada, o que podia causar confusão.
    # Esta nova lógica é mais clara e segue a regra de negócio.


    try:
        if db_ticket.assignee_id:
            notify_ticket_created(db, user_id=db_ticket.assignee_id, ticket_id=db_ticket.id)
        admins: List[User] = db.query(User).filter(User.is_admin == True, User.is_active == True).all()
        print(f"[quantidade de registro]: {len(admins)}")

        asyncio.create_task(notify_ticket_wsb_async(db_ticket, msg="Novo chamado criado. Tk:"+ str(db_ticket.id),notif_type= "ticket_created"))
        for admin in admins:           
            user_data = {c.name: getattr(admin, c.name) for c in admin.__table__.columns}            
            asyncio.create_task(notify_ticket_created_async(user_id=admin.id, ticket_id=db_ticket.id))

       
        
    except Exception as e:
        print(f"[ERRO ao notificar admins]: {e}")
        pass

    return db_ticket

def update_ticket(db: Session, db_ticket: Ticket, ticket_update: TicketUpdate, attachment: Optional[UploadFile] = None):
    # Converte o Pydantic model para um dicionário, excluindo campos não definidos
    # e também excluindo campos que são None para evitar violar restrições NOT NULL
    update_data = ticket_update.model_dump(exclude_unset=True)

    # [AJUSTE AQUI] Lógica de validação para o atribuidor (assignee_id)
    # Movemos a regra de permissão para a rota (router/ticket.py), que é o lugar ideal para lidar com isso.
    # A função CRUD agora apenas valida se o novo 'assignee_id' é de um técnico válido, mas a ROTA decidirá se o usuário tem permissão para fazer a mudança.
    if "assignee_id" in update_data and update_data["assignee_id"] is not None:
        new_assignee_id = update_data["assignee_id"]
        assignee_user = db.query(User).filter(User.id == new_assignee_id).first()
        if not assignee_user or not (assignee_user.is_admin or assignee_user.is_super_admin):
            raise ValueError("ID de atribuidor inválido. O atribuidor deve ser um usuário técnico (Admin) ou um SuperAdmin existente.")
            
    # Se um ticket sem atribuição for colocado em andamento, mudar para "open"
    # Esta lógica pode precisar de revisão dependendo do fluxo de negócio exato.
    # Se o objetivo é apenas delegar, o status não deveria mudar automaticamente para "open" se já estiver "in_progress".
    # Se o status é enviado no update_data, ele sobrescreverá esta lógica.
    elif "assignee_id" in update_data and update_data["assignee_id"] is None:
        if "status" not in update_data and db_ticket.status == TicketStatus.in_progress.value:
            update_data["status"] = TicketStatus.open.value
            
    # Lógica para tratamento do anexo (upload ou remoção)
    if attachment:
        if db_ticket.attachment_url:
            _delete_attachment_file(db_ticket.attachment_url)
        try:
            new_attachment_url = _save_upload_file(attachment)
            setattr(db_ticket, "attachment_url", new_attachment_url)
        except HTTPException as e:
            raise e
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Erro inesperado ao salvar o novo anexo: {e}")
    elif "attachment_url" in update_data and update_data["attachment_url"] is None:
        if db_ticket.attachment_url:
            _delete_attachment_file(db_ticket.attachment_url)
        setattr(db_ticket, "attachment_url", None)
    
    # Itera sobre os dados de atualização e SÓ ATUALIZA se o valor NÃO FOR NONE
    for key, value in update_data.items():
        # Lógica para o campo 'status' (converte Enum para string)
        if key == "status" and isinstance(value, TicketStatus):
            setattr(db_ticket, key, value.value)
        # Ignora 'attachment_url' se já foi tratado e SÓ ATUALIZA se o valor NÃO FOR NONE
        elif key != "attachment_url" and value is not None: 
            setattr(db_ticket, key, value)
            
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    
    # Recarrega o ticket para incluir os objetos de relacionamento completos para a resposta
    db_ticket = db.query(Ticket)\
                    .options(joinedload(Ticket.requester))\
                    .options(joinedload(Ticket.assignee))\
                    .filter(Ticket.id == db_ticket.id).first()
    return db_ticket

def delete_ticket(db: Session, ticket_id: int):
    db_ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if db_ticket:
        # Antes de deletar o ticket do banco de dados, deleta o arquivo anexo se existir
        if db_ticket.attachment_url:
            _delete_attachment_file(db_ticket.attachment_url)

        db.delete(db_ticket)
        db.commit()
        return True
    return False

def accept_ticket(db: Session, ticket_id: int, current_user: User):
    db_ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not db_ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if not (current_user.is_admin or current_user.is_super_admin):
        raise HTTPException(status_code=403, detail="Não autorizado a aceitar chamados.")

    if db_ticket.status != TicketStatus.open.value:
        raise ValueError("Chamado não pode ser aceito, pois não está com status 'aberto'.")

    # Atribui o ticket ao técnico logado se ainda não estiver atribuído
    if db_ticket.assignee_id is None:
        db_ticket.assignee_id = current_user.id
    # Ou verifica se já está atribuído ao técnico logado
    elif db_ticket.assignee_id != current_user.id:
        raise ValueError("Chamado já está atribuído a outro técnico.")

    db_ticket.status = TicketStatus.in_progress.value
    db_ticket.updated_at = datetime.now()
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)

    db_ticket = db.query(Ticket)\
                    .options(joinedload(Ticket.requester))\
                    .options(joinedload(Ticket.assignee))\
                    .filter(Ticket.id == db_ticket.id).first()
    

    notify_ticket_accept(db, user_id=db_ticket.requester_id, ticket_id=db_ticket.id)
    return db_ticket

def close_ticket(db: Session, ticket_id: int, current_user: User, observation: Optional[str] = None):
    db_ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    
    if not db_ticket:
        raise HTTPException(status_code=404, detail="Ticket não encontrado.")

  
    if not (current_user.is_admin or current_user.is_super_admin):
        raise HTTPException(status_code=403, detail="Não autorizado a fechar chamados.")

    
    if db_ticket.status in [TicketStatus.closed.value, TicketStatus.cancelled.value, TicketStatus.resolved.value]:
        raise ValueError("Chamado já está fechado, cancelado ou resolvido.")
    
    if db_ticket.assignee_id is None or db_ticket.assignee_id != current_user.id:
        raise HTTPException(
            status_code=403, 
            detail="Você não pode fechar este chamado porque não está atribuído a você."
        )

   
    db_ticket.status = TicketStatus.closed.value
    db_ticket.observation = observation
    db_ticket.updated_at = datetime.now()
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)

    # Recarrega o ticket para a resposta
    db_ticket = db.query(Ticket)\
                      .options(joinedload(Ticket.requester))\
                      .options(joinedload(Ticket.assignee))\
                      .filter(Ticket.id == db_ticket.id).first()
    
    # Notificação do solicitante
    notify_ticket_close(db, user_id=db_ticket.requester_id, ticket_id=db_ticket.id)
    return db_ticket

def get_tickets_stats_for_user(db: Session, current_user: User) -> dict:
    """
    Retorna as estatísticas de tickets com base no perfil do usuário.
    """
    stats = {}
    
    # Lógica para o ADMIN/TECNICO
    if current_user.is_super_admin: # Assumindo que super_admin é o ADMIN/TECNICO
        stats["open_tickets_all_techs"] = db.query(Ticket).filter(Ticket.status == TicketStatus.open.value).count()
        stats["in_progress_tickets_all"] = db.query(Ticket).filter(Ticket.status == TicketStatus.in_progress.value).count()
        stats["closed_tickets_all"] = db.query(Ticket).filter(Ticket.status.in_([TicketStatus.closed.value, TicketStatus.resolved.value])).count()
        stats["total_resolved_all_techs"] = db.query(Ticket).filter(Ticket.status == TicketStatus.resolved.value).count()

    # Lógica para o TECNICO
    elif current_user.is_admin: # Assumindo que is_admin é o TECNICO
        stats["open_tickets_assigned_to_me"] = db.query(Ticket).filter(
            (Ticket.status == TicketStatus.open.value) &
            (Ticket.assignee_id == current_user.id)
        ).count()
        stats["in_progress_tickets_all"] = db.query(Ticket).filter(Ticket.status == TicketStatus.in_progress.value).count()
        stats["closed_by_me"] = db.query(Ticket).filter(
            (Ticket.status == TicketStatus.closed.value) &
            (Ticket.assignee_id == current_user.id)
        ).count()
        stats["total_resolved_all_techs"] = db.query(Ticket).filter(Ticket.status == TicketStatus.resolved.value).count()

    # Lógica para o USUARIO COMUM
    else:
        stats["open_tickets"] = db.query(Ticket).filter(
            (Ticket.requester_id == current_user.id) &
            (Ticket.status == TicketStatus.open.value)
        ).count()
        stats["in_progress_tickets"] = db.query(Ticket).filter(
            (Ticket.requester_id == current_user.id) &
            (Ticket.status == TicketStatus.in_progress.value)
        ).count()
        stats["closed_tickets"] = db.query(Ticket).filter(
            (Ticket.requester_id == current_user.id) &
            (Ticket.status.in_([TicketStatus.closed.value, TicketStatus.resolved.value]))
        ).count()
        stats["total_created_by_me"] = db.query(Ticket).filter(Ticket.requester_id == current_user.id).count()

    return stats