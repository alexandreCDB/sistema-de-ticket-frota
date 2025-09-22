from .user import (
    get_user,
    get_user_by_email,
    get_users,           # Certifique que está aqui
    create_user,
    update_user,
    delete_user,
    get_password_hash,
    authenticate_user,
    get_assignable_users
)
from .ticket import (
    get_ticket, get_tickets, create_ticket, update_ticket, delete_ticket
)
from .message import (
    get_message, get_messages_by_ticket, create_message
)
