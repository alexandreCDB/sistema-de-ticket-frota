import asyncio
from fastapi import FastAPI, APIRouter, WebSocket, WebSocketDisconnect
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from backend.frota.database import engine as frota_engine
from backend.frota.models import vehicle, booking, cnh, fuel_supply
from backend.ticket.routers.auth_router import router as auth_router
from backend.ticket.routers import users_router, tickets_router, messages_router, notification_router
from backend.frota.routers.vehicle import router as frota_vehicles_router
from backend.frota.routers.booking import router as frota_bookings_router
from backend.frota.routers.upload import router as frota_upload_router
from backend.frota.routers import user_cnh
from backend.websocket.service.settings import get_online_users_data, get_system_stats
from backend.websocket.service.ws_instance import manager
from backend.frota.routers.fuel_supply import router as frota_fuel_supplies_router
from backend.frota.services.fuel_reminder_service import fuel_reminder_service
from backend.frota.services.vehicle_status_service import vehicle_status_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Application startup event triggered.")
    print("🔧 Criando tabelas da Frota...")

    vehicle.Base.metadata.create_all(bind=frota_engine)
    booking.Base.metadata.create_all(bind=frota_engine)
    cnh.Base.metadata.create_all(bind=frota_engine)
    fuel_supply.Base.metadata.create_all(bind=frota_engine)

    print("✅ Banco de dados da Frota configurado com sucesso.")

    # 🔁 Inicia scheduler de abastecimento
    scheduler_task = asyncio.create_task(
        fuel_reminder_service.start_scheduler()
    )
    print("⛽ Agendador de notificações de abastecimento iniciado")

    # 📡 Inicia broadcast do websocket
    broadcast_task = asyncio.create_task(broadcast_system_stats())
    print("📡 Broadcast de system stats iniciado")

    # 🚗 Inicia scheduler de status de veículos
    status_task = asyncio.create_task(
        vehicle_status_service.start_scheduler()
    )
    print("🚗 Agendador de status de veículos iniciado")

    # 🔥 APLICAÇÃO RODANDO
    yield

    # 🧹 SHUTDOWN
    print("🧹 Application shutdown event triggered.")

    fuel_reminder_service.stop()
    scheduler_task.cancel()

    broadcast_task.cancel()
    status_task.cancel()
    try:
        await broadcast_task
        await status_task
    except asyncio.CancelledError:
        print("📴 Broadcast e Status Tasks cancelados")

    print("✅ Lifespan finalizado com sucesso")

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

app = FastAPI(
    title="Sistema Integrado de Gestão",
    description="API para gerenciamento de tickets e frota de veículos.",
    version="0.1.0",
    lifespan=lifespan
)

origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://localhost:5177",
    "http://localhost:5178",
    "http://localhost:5179",
    "http://127.0.0.1:5173",
    "http://192.168.13.149:5173",
    "http://192.168.13.149:5174",
    "http://192.168.13.149:5175",
    "http://192.168.13.149:5176",
    "http://192.168.13.149:5177",
    "http://192.168.13.149:5178",
    "http://192.168.13.149:8000",
    "http://192.168.13.158:5173",
    "http://192.168.13.158:5174",
    "http://192.168.13.158:5175",
    "http://192.168.13.158:5176",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

current_file_path = os.path.dirname(os.path.abspath(__file__))
upload_directory = os.path.join(current_file_path, "uploads")
if not os.path.exists(upload_directory):
    os.makedirs(upload_directory)
app.mount("/uploads", StaticFiles(directory=upload_directory), name="uploads")

# ✅ NOVO: Pasta separada para uploads da frota (evita conflito com outro sistema)
uploads_frota_directory = os.path.join(current_file_path, "uploads_frota")
if not os.path.exists(uploads_frota_directory):
    os.makedirs(uploads_frota_directory)
app.mount("/uploads_frota", StaticFiles(directory=uploads_frota_directory), name="uploads_frota")


api_router = APIRouter(prefix="/api")

api_router.include_router(auth_router, prefix="/auth", tags=["Auth"])

ticket_api_router = APIRouter(prefix="/ticket")
ticket_api_router.include_router(users_router, tags=["Ticket - Users"])
ticket_api_router.include_router(tickets_router, tags=["Ticket - Tickets"])
ticket_api_router.include_router(messages_router, tags=["Ticket - Msgs"])
ticket_api_router.include_router(notification_router, tags=["Ticket - Notifications"])
api_router.include_router(ticket_api_router)

frota_api_router = APIRouter(prefix="/frota")
frota_api_router.include_router(frota_vehicles_router, prefix="/vehicles", tags=["Frota - Veículos"])
frota_api_router.include_router(frota_bookings_router, prefix="/bookings", tags=["Frota - Reservas"])
frota_api_router.include_router(frota_upload_router, prefix="/upload", tags=["Frota - Uploads"])
frota_api_router.include_router(frota_fuel_supplies_router, tags=["Frota - Abastecimentos"])
frota_api_router.include_router(user_cnh.router, prefix="/admin/users/cnh", tags=["Frota - Admin CNH"])
api_router.include_router(frota_api_router)

app.include_router(api_router)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = None):
    # Log para depuração
    print(f"📡 Tentativa de conexão WS. Token recebido: {token}")
    
    # Se o token não veio via parâmetro automático do FastAPI, tenta pegar manualmente
    if not token:
        token = websocket.query_params.get("token")
        print(f"📡 Token extraído manualmente: {token}")

    if not token:
        print("❌ Conexão WS negada: Token ausente")
        # Para websockets, precisamos aceitar antes de fechar se quisermos ser gentis,
        # ou apenas fechar se for uma rejeição imediata.
        # Mas o manager.connect já faz o accept.
        # Se chegamos aqui sem token, nem chamamos o manager.
        await websocket.accept()
        await websocket.close(code=1008)
        return

    await manager.connect(websocket, token)
    try:
        while True:
            data = await websocket.receive_text()
            print("📩 Mensagem recebida:", data)
            # await manager.broadcast(f"Echo: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"❌ Erro no loop do WebSocket: {e}")
        manager.disconnect(websocket)

@app.get("/check-fuel-routes")
def check_fuel_routes():
    fuel_routes = []
    for route in app.routes:
        if hasattr(route, "path") and "fuel" in route.path:
            fuel_routes.append({
                "path": route.path,
                "methods": list(route.methods) if hasattr(route, "methods") else []
            })
    return {"fuel_routes": fuel_routes}


@app.get("/")
def root():
    return {"status": "ok", "message": "API rodando com sucesso 🚗"}

