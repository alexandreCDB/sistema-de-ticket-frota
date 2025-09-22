from pydantic import BaseModel
from typing import Optional

class TicketStatsResponse(BaseModel):
    # Campos para o ADMIN/TECNICO
    open_tickets_all_techs: Optional[int] = None
    in_progress_tickets_all: Optional[int] = None
    closed_tickets_all: Optional[int] = None
    total_resolved_all_techs: Optional[int] = None
    
    # Campos para o TECNICO
    open_tickets_assigned_to_me: Optional[int] = None
    closed_by_me: Optional[int] = None

    # Campos para o USUARIO COMUM
    open_tickets: Optional[int] = None
    in_progress_tickets: Optional[int] = None
    closed_tickets: Optional[int] = None
    total_created_by_me: Optional[int] = None