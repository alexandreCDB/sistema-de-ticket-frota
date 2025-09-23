from fastapi import FastAPI, APIRouter, WebSocket, WebSocketDisconnect
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# --- INICIALIZAÇÃO DOS MÓDULOS E BANCOS DE DADOS ---
from backend.frota.database import engine as frota_engine
from backend.frota.models import vehicle, booking

# --- IMPORTANDO OS ROTEADORES ---
# 1. Roteador de Autenticação
from backend.ticket.routers.auth_router import router as auth_router

# 2. Roteadores do Ticket
from backend.ticket.routers import users_router, tickets_router, messages_router, notification_router

# 3. Roteadores da Frota
from backend.frota.routers.vehicle import router as frota_vehicles_router
from backend.frota.routers.booking import router as frota_bookings_router

<<<<<<< HEAD
# --- LIFESPAN PARA STARTUP/SHUTDOWN ---
=======
from backend.websocket.service.ws_instance import manager

>>>>>>> c0c865bb1533616d472288361102cf25fe580bc3
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Application startup event triggered.")
    print("Criando tabelas da Frota (se não existirem)...")
    vehicle.Base.metadata.create_all(bind=frota_engine)
    booking.Base.metadata.create_all(bind=frota_engine)
    print("Configuração do banco de dados completa.")
    yield
    print("Application shutdown event triggered.")

app = FastAPI(
    title="Sistema Integrado de Gestão",
    description="API para gerenciamento de tickets e frota de veículos.",
    version="0.1.0",
    lifespan=lifespan
)

# --- CONFIGURAÇÃO CORS ---
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://192.168.13.149:5173",
    "http://192.168.13.158:5173",
    "http://192.168.13.249:5173",
    "http://192.168.56.1:5173",
    "http://192.168.13.136:5173",
    "http://192.168.13.136:8000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- SERVIR ARQUIVOS ESTÁTICOS (UPLOADS) ---
current_file_path = os.path.dirname(os.path.abspath(__file__))
upload_directory = os.path.join(current_file_path, "..", "uploads")
if not os.path.exists(upload_directory):
    os.makedirs(upload_directory)
app.mount("/uploads", StaticFiles(directory=upload_directory), name="uploads")

# --- DEFINIÇÃO DOS ROUTERS PRINCIPAIS ---
api_router = APIRouter(prefix="/api")

# --- AUTENTICAÇÃO ---
api_router.include_router(auth_router, prefix="/auth", tags=["Auth"])

# --- TICKET ---
ticket_api_router = APIRouter(prefix="/ticket")
ticket_api_router.include_router(users_router, tags=["Ticket - Users"])
ticket_api_router.include_router(tickets_router, tags=["Ticket - Tickets"])
ticket_api_router.include_router(messages_router, tags=["Ticket - Msgs"])
ticket_api_router.include_router(notification_router, tags=["Ticket - Notifications"])
api_router.include_router(ticket_api_router)

# --- FROTA ---
frota_api_router = APIRouter(prefix="/frotas")

# Importante: incluímos o prefixo "/" dentro do router de veículos
# Assim, GET /api/frotas/vehicles/ → lista todos
# GET /api/frotas/vehicles/{vehicle_id} → pega por id
frota_api_router.include_router(frota_vehicles_router, prefix="/vehicles", tags=["Frota - Veículos"])
frota_api_router.include_router(frota_bookings_router, prefix="/bookings", tags=["Frota - Reservas"])
api_router.include_router(frota_api_router)

<<<<<<< HEAD
# --- MONTAGEM FINAL ---
app.include_router(api_router)
=======
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str):
    await manager.connect(websocket, token)
    try:
        while True:
            data = await websocket.receive_text()
            print("📩 Mensagem recebida:", data)
            await manager.broadcast(f"Echo: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
# Monta o router principal com o prefixo /api na aplicação
app.include_router(api_router)
>>>>>>> c0c865bb1533616d472288361102cf25fe580bc3
