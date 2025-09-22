# backend/routers/__init__.py
from .users import router as users_router
from .ticket import router as tickets_router
from .auth_router import router as auth_router
from .message import router as messages_router # <--- ADICIONE ESTA LINHA
from .notification import router as notification_router