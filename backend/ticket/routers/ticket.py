import os
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status, File, UploadFile, Form, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from backend.ticket.schemas.ticket import CloseTicketRequest, TicketCreate, TicketUpdate, TicketResponse, TicketPaginationResponse
from backend.ticket.crud import ticket as crud_ticket
from backend.dependencies import get_db, get_current_user, get_current_admin_user, get_current_super_admin_user
from backend.models.user import User
from backend.ticket.models.ticket import TicketStatus
from backend.ticket.services.tasks import  send_ticket_closed_email_background

router = APIRouter(
    prefix="/tickets",
    tags=["tickets"]
)

@router.get("/my-tickets/", response_model=TicketPaginationResponse, summary="Obter meus chamados (solicitados por mim)")
async def read_my_tickets_route(
    status: Optional[List[TicketStatus]] = Query(None, description="Filtrar por um ou mais status do chamado."),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retorna uma lista paginada de chamados solicitados pelo usuário autenticado.
    """
    try:
        tickets, total_tickets = crud_ticket.get_tickets(
            db,
            current_user=current_user,
            requester_id=current_user.id,
            status=status,
            skip=skip,
            limit=limit
        )
        
        return {
            "items": tickets,
            "total_tickets": total_tickets,
            "skip": skip,
            "limit": limit
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))

@router.get("/assigned-to-me-or-unassigned/", response_model=TicketPaginationResponse, summary="Obter chamados atribuídos a mim ou não atribuídos (para técnicos/admins)")
async def read_assigned_or_unassigned_tickets_route(
    status: Optional[List[TicketStatus]] = Query(None, description="Filtrar por um ou mais status do chamado."),
    include_closed_or_resolved: bool = Query(False, description="Incluir chamados resolvidos/fechados/cancelados no relatório."),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Retorna uma lista paginada de chamados atribuídos ao técnico logado ou que não estão atribuídos.
    """
    try:
        tickets, total_tickets = crud_ticket.get_assigned_and_unassigned_tickets(
            db,
            current_user=current_user,
            status=status,
            include_closed_or_resolved=include_closed_or_resolved,
            skip=skip,
            limit=limit
        )
        
        return {
            "items": tickets,
            "total_tickets": total_tickets,
            "skip": skip,
            "limit": limit
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))

@router.get("/all/", response_model=TicketPaginationResponse, summary="Obter todos os chamados (apenas para Super Admins)")
async def read_all_tickets_route(
    status: Optional[List[TicketStatus]] = Query(None, description="Filtrar por um ou mais status do chamado."),
    include_closed_or_resolved: bool = Query(False, description="Incluir chamados resolvidos/fechados/cancelados no relatório."),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_super_admin_user)
):
    """
    Retorna uma lista paginada de todos os chamados no sistema, sem restrição de atribuição.
    """
    try:
        tickets, total_tickets = crud_ticket.get_all_tickets(
            db,
            status=status,
            include_closed_or_resolved=include_closed_or_resolved,
            skip=skip,
            limit=limit
        )
        
        return {
            "items": tickets,
            "total_tickets": total_tickets,
            "skip": skip,
            "limit": limit
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro interno ao buscar todos os chamados: {e}")

@router.get("/{ticket_id}", response_model=TicketResponse, summary="Obter um chamado por ID")
async def read_ticket_route(
    ticket_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Retorna os detalhes de um chamado específico.
    O acesso é permitido ao solicitante, ao técnico atribuído ou a um Super Admin.
    """
    db_ticket = crud_ticket.get_ticket(db, ticket_id=ticket_id)
    if not db_ticket:
        raise HTTPException(status_code=404, detail="Ticket não encontrado.")
    
    # Validação de permissão de acesso ao ticket
    is_requester = db_ticket.requester_id == current_user.id
    is_assignee = db_ticket.assignee_id == current_user.id
    is_super_admin = current_user.is_super_admin
    is_admin_but_not_assignee = current_user.is_admin and db_ticket.assignee_id != current_user.id and db_ticket.assignee_id is not None
    
    # Se o usuário é um admin, ele pode visualizar tickets não atribuídos a ninguém.
    if current_user.is_admin and db_ticket.assignee_id is None:
        is_assignee = True

    if not (is_requester or is_assignee or is_super_admin):
        raise HTTPException(status_code=403, detail="Você não tem permissão para visualizar este chamado.")

    return db_ticket

@router.post("/", response_model=TicketResponse, summary="Criar um novo chamado", status_code=status.HTTP_201_CREATED)
async def create_ticket_route(
    title: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    priority: str = Form(...),
    assignee_id: Optional[int] = Form(None),
    attachment: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Cria um novo chamado.
    - **title**: Título do chamado.
    - **description**: Descrição detalhada do problema.
    - **category**: Categoria do problema.
    - **priority**: Prioridade do chamado.
    - **assignee_id**: (Opcional) ID do técnico a ser atribuído. Somente Super Admins podem atribuir.
    - **attachment**: (Opcional) Arquivo anexo.
    """
    
    # Validação de permissão para atribuir tickets
    if assignee_id is not None and not current_user.is_super_admin:
        raise HTTPException(status_code=403, detail="Apenas Super Admins podem atribuir chamados na criação.")

    ticket_data = TicketCreate(
        title=title, 
        description=description, 
        category=category, 
        priority=priority, 
        assignee_id=assignee_id
    )

    try:
        new_ticket = crud_ticket.create_ticket(
            db=db, 
            ticket_data=ticket_data, 
            requester_id=current_user.id,
            attachment=attachment
        )
        return new_ticket
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno ao criar o chamado: {e}")

@router.put("/{ticket_id}", response_model=TicketResponse, summary="Atualizar um chamado")
async def update_ticket_route(
    ticket_id: int, 
    # MUDANÇA AQUI: usando Form e File em vez do modelo TicketUpdate
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    priority: Optional[str] = Form(None),
    status_str: Optional[str] = Form(None, alias="status"),
    assignee_id: Optional[int] = Form(None),
    attachment: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Atualiza os detalhes de um chamado.
    """
    db_ticket = crud_ticket.get_ticket(db, ticket_id=ticket_id)
    if not db_ticket:
        raise HTTPException(status_code=404, detail="Ticket não encontrado.")

    # Converte a string de status de volta para um enum TicketStatus, se existir
    status_enum = None
    if status_str:
        try:
            status_enum = TicketStatus(status_str)
        except ValueError:
            raise HTTPException(status_code=400, detail="Status inválido.")

    # Cria o objeto TicketUpdate a partir dos dados do formulário
    ticket_update_data = {
        "title": title,
        "description": description,
        "category": category,
        "priority": priority,
        "status": status_enum,
        "assignee_id": assignee_id
    }

    # Remove chaves com valor None para que o model_dump(exclude_unset=True) funcione corretamente.
    ticket_update_data = {k: v for k, v in ticket_update_data.items() if v is not None}
    ticket_update = TicketUpdate(**ticket_update_data)

    # Regras de permissão para atualização
    is_requester = db_ticket.requester_id == current_user.id
    is_assignee = db_ticket.assignee_id == current_user.id
    is_super_admin = current_user.is_super_admin
    
    if current_user.is_admin and db_ticket.assignee_id is None:
        is_assignee = True

    if not (is_requester or is_assignee or is_super_admin):
        raise HTTPException(status_code=403, detail="Você não tem permissão para atualizar este chamado.")

    if ticket_update.assignee_id is not None and not current_user.is_super_admin:
        if ticket_update.assignee_id != current_user.id:
             raise HTTPException(status_code=403, detail="Você não tem permissão para alterar a atribuição de um chamado.")
    
    if not current_user.is_admin and not current_user.is_super_admin:
        if ticket_update.status in [TicketStatus.closed, TicketStatus.resolved, TicketStatus.in_progress]:
            raise HTTPException(status_code=403, detail="Você não tem permissão para alterar o status do chamado.")
            
    if current_user.is_admin and not current_user.is_super_admin:
        if ticket_update.assignee_id and ticket_update.assignee_id != current_user.id:
            raise HTTPException(status_code=403, detail="Você não pode atribuir este chamado a outro técnico.")

    try:
        updated_ticket = crud_ticket.update_ticket(db, db_ticket, ticket_update, attachment=attachment)
        return updated_ticket
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno ao atualizar o chamado: {e}")

@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Deletar um chamado")
async def delete_ticket_route(
    ticket_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Deleta um chamado. Apenas o solicitante original ou um Super Admin podem deletar.
    """
    db_ticket = crud_ticket.get_ticket(db, ticket_id=ticket_id)
    if not db_ticket:
        raise HTTPException(status_code=404, detail="Ticket não encontrado.")

    if not (db_ticket.requester_id == current_user.id or current_user.is_super_admin):
        raise HTTPException(status_code=403, detail="Você não tem permissão para deletar este chamado.")
    
    crud_ticket.delete_ticket(db, ticket_id=ticket_id)
    return {"message": "Ticket deletado com sucesso."}

@router.post("/{ticket_id}/accept", response_model=TicketResponse, summary="Aceitar um chamado (para técnicos)")
async def accept_ticket_route(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Aceita um chamado, atribuindo-o ao técnico logado e mudando o status para 'em_progresso'.
    """
    try:
        accepted_ticket = crud_ticket.accept_ticket(db=db, ticket_id=ticket_id, current_user=current_user)
        return accepted_ticket
    except HTTPException as e:
        raise e
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{ticket_id}/close", response_model=TicketResponse, summary="Fechar um chamado (para técnicos)")
async def close_ticket_route(
    ticket_id: int,
    payload: CloseTicketRequest, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    background_tasks: BackgroundTasks = None
):
    """
    Fecha um chamado, mudando seu status para 'fechado'.
    """
    try:
        closed_ticket = crud_ticket.close_ticket(db=db, ticket_id=ticket_id, current_user=current_user,observation=payload.observation)
        
        # try:
        # except:
        #     pass
        send_ticket_closed_email_background(
            background_tasks=background_tasks,
            ticket_id=closed_ticket.id
        )
        return closed_ticket
    except HTTPException as e:
        raise e
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
        
@router.get("/stats/", summary="Obter estatísticas de tickets para o usuário logado")
async def get_stats_route(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retorna estatísticas de chamados relevantes para o usuário logado (comum, admin ou super admin).
    """
    try:
        stats = crud_ticket.get_tickets_stats_for_user(db, current_user)
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))