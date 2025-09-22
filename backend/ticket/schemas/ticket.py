# backend/schemas/ticket.py
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from backend.ticket.models.ticket import TicketStatus
from backend.ticket.schemas.user import UserBase 
# >>> IMPORTAR UploadFile do FastAPI
from fastapi import UploadFile, Form # Importe Form para campos que não são arquivos

# Schema Base para campos comuns a tickets
class TicketBase(BaseModel):
    title: str
    description: str
    category: str
    priority: str

# Schema para criação de ticket (o que o usuário envia)
class TicketCreate(TicketBase):
    assignee_id: Optional[int] = None

    # NOVO: Adicione este método para compatibilidade com UploadFile
    # O Pydantic espera que todos os campos venham de um JSON ou Form.
    # Quando usamos UploadFile, outros campos podem vir como Form Data.
    # Este método de classe permite que o Pydantic construa o objeto
    # a partir de dados de formulário, onde alguns campos podem ser strings e outros arquivos.
    @classmethod
    def as_form(
        cls,
        title: str = Form(...),
        description: str = Form(...),
        category: str = Form(...),
        priority: str = Form(...),
        assignee_id: Optional[int] = Form(None),
    ):
        return cls(
            title=title,
            description=description,
            category=category,
            priority=priority,
            assignee_id=assignee_id,
        )

# Schema para atualização de ticket (campos opcionais, herda de TicketBase)
class TicketUpdate(TicketBase):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[TicketStatus] = None
    assignee_id: Optional[int] = None

    # NOVO: Adicione este método para compatibilidade com UploadFile na atualização
    @classmethod
    def as_form(
        cls,
        title: Optional[str] = Form(None),
        description: Optional[str] = Form(None),
        category: Optional[str] = Form(None),
        priority: Optional[str] = Form(None),
        status: Optional[TicketStatus] = Form(None),
        assignee_id: Optional[int] = Form(None),
    ):
        return cls(
            title=title,
            description=description,
            category=category,
            priority=priority,
            status=status,
            assignee_id=assignee_id,
        )


# Schema para resposta do ticket (o que a API retorna)
class TicketResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str
    priority: str
    status: TicketStatus
    requester_id: int
    assignee_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    attachment_url: Optional[str] = None # <<<< NOVO CAMPO AQUI
    observation: Optional[str] = None
    requester: 'UserBase'
    assignee: Optional['UserBase'] = None

    class Config:
        from_attributes = True
        use_enum_values = True

TicketResponse.model_rebuild()

# --- NOVO SCHEMA PARA PAGINAÇÃO ---

class TicketPaginationResponse(BaseModel):
    """
    Schema para encapsular a resposta de uma lista de tickets paginada.
    """
    items: List[TicketResponse]
    total_tickets: int
    skip: int
    limit: int
    
    class Config:
        from_attributes = True

class CloseTicketRequest(BaseModel):
    observation: Optional[str] = None