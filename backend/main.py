import asyncio
from fastapi import FastAPI, APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

# --- INICIALIZAÇÃO DOS MÓDULOS E BANCOS DE DADOS ---
from backend.frota.database import engine as frota_engine
from backend.frota.models import vehicle, booking, cnh  # Importação CNH garantida

# --- IMPORTANDO OS ROTEADORES ---
from backend.ticket.routers.auth_router import router as auth_router
from backend.ticket.routers import users_router, tickets_router, messages_router, notification_router
from backend.frota.routers.vehicle import router as frota_vehicles_router
from backend.frota.routers.booking import router as frota_bookings_router
from backend.frota.routers.upload import router as frota_upload_router
from backend.frota.routers import user_cnh  # 🚨 Importação da rota CNH
from backend.websocket.service.settings import get_online_users_data, get_system_stats
from backend.websocket.service.ws_instance import manager


# --- FUNÇÃO LIFESPAN UNIFICADA ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Application startup event triggered.")
    print("🔧 Criando tabelas da Frota (se não existirem)...")

    # Cria as tabelas no banco de Frota
    vehicle.Base.metadata.create_all(bind=frota_engine)
    booking.Base.metadata.create_all(bind=frota_engine)
    cnh.Base.metadata.create_all(bind=frota_engine)  # Cria a tabela CNH

    print("✅ Banco de dados da Frota configurado com sucesso.")

    broadcast_task = asyncio.create_task(broadcast_system_stats())
    print("📡 Lifespan iniciado: broadcast ativo")

    yield

    broadcast_task.cancel()
    try:
        await broadcast_task
    except asyncio.CancelledError:
        print("📴 Lifespan finalizado: broadcast cancelado")
    print("🧹 Application shutdown event triggered.")


# --- TAREFA DO WEBSOCKET ---
async def broadcast_system_stats():
    while True:
        stats = get_system_stats()
        users = await get_online_users_data()
        stats["connections"] = sum(len(conns) for conns in manager.active_connections.values())
        await manager.broadcast("system_stats", {
            "server_stats": stats,
            "users_stats": users
        })
        await asyncio.sleep(2)


# --- APP ---
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
    "http://192.168.13.149:8000",
    "http://192.168.13.158:5173",
    "http://192.168.13.249:5173",
    "http://192.168.56.1:5173",
    "http://192.168.13.136:5173",
    "http://192.168.13.136:8000",
    "http://192.168.13.159:8000",
    "http://192.168.13.159:5173",
    "http://192.168.13.159:300",
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
upload_directory = os.path.join(current_file_path, "uploads")
if not os.path.exists(upload_directory):
    os.makedirs(upload_directory)
app.mount("/uploads", StaticFiles(directory=upload_directory), name="uploads")


# --- DEFINIÇÃO DOS ROUTERS PRINCIPAIS ---
api_router = APIRouter(prefix="/api")

# 🔹 AUTENTICAÇÃO
api_router.include_router(auth_router, prefix="/auth", tags=["Auth"])

# 🔹 TICKET
ticket_api_router = APIRouter(prefix="/ticket")
ticket_api_router.include_router(users_router, tags=["Ticket - Users"])
ticket_api_router.include_router(tickets_router, tags=["Ticket - Tickets"])
ticket_api_router.include_router(messages_router, tags=["Ticket - Msgs"])
ticket_api_router.include_router(notification_router, tags=["Ticket - Notifications"])
api_router.include_router(ticket_api_router)

# 🔹 FROTA
frota_api_router = APIRouter(prefix="/frota")

frota_api_router.include_router(frota_vehicles_router, prefix="/vehicles", tags=["Frota - Veículos"])
frota_api_router.include_router(frota_bookings_router, prefix="/bookings", tags=["Frota - Reservas"])
frota_api_router.include_router(frota_upload_router, prefix="/upload", tags=["Frota - Uploads"])

# 🚨 ROTA CNH ADMIN: Fica em /api/frota/admin/users/cnh/
frota_api_router.include_router(user_cnh.router, prefix="/admin/users/cnh", tags=["Frota - Admin CNH"])

api_router.include_router(frota_api_router)


# --- WEBSOCKET ---
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


# --- MONTAGEM FINAL ---
app.include_router(api_router)



# --- ROTA PRINCIPAL ---
@app.get("/")
def root():
    return {"status": "ok", "message": "API rodando com sucesso 🚗"}
