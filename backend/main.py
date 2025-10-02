import asyncio
from fastapi import FastAPI, APIRouter, WebSocket, WebSocketDisconnect, HTTPException # ADICIONADO HTTPException
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse # NOVO IMPORT: Para retornar o index.html como fallback
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
from backend.frota.routers.upload import router as frota_upload_router

# 4. Import do Gerenciador de WebSocket
from backend.websocket.service.settings import get_online_users_data, get_system_stats
from backend.websocket.service.ws_instance import manager


# --- FUNÇÃO LIFESPAN UNIFICADA ---
@asynccontextmanager
async def lifespan(app: FastAPI):
  # Setup inicial do banco
  print("Application startup event triggered.")
  print("Criando tabelas da Frota (se não existirem)...")
  vehicle.Base.metadata.create_all(bind=frota_engine)
  booking.Base.metadata.create_all(bind=frota_engine)
  print("Configuração do banco de dados completa.")

  # Setup do websocket
  broadcast_task = asyncio.create_task(broadcast_system_stats())
  print("✅ Lifespan iniciado: broadcast ativo")

  yield # app roda aqui

  # Shutdown
  broadcast_task.cancel()
  try:
    await broadcast_task
  except asyncio.CancelledError:
    print("✅ Lifespan finalizado: broadcast cancelado")
  print("Application shutdown event triggered.")


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
  allow_origins=["*"], # Permitir todas as origens
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
frota_api_router.include_router(frota_vehicles_router, prefix="/vehicles", tags=["Frota - Veículos"])
frota_api_router.include_router(frota_bookings_router, prefix="/bookings", tags=["Frota - Reservas"])
frota_api_router.include_router(frota_upload_router, prefix="/upload", tags=["Frota - Uploads"])
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


# --- SERVIR O FRONTEND BUILD (React) ---
frontend_build_dir = os.path.join(
  os.path.dirname(os.path.abspath(__file__)),
  "../frontend/dist"  # 👈 caminho até a pasta gerada pelo build do Vite
)
frontend_index_path = os.path.join(frontend_build_dir, "index.html") # Define o caminho para index.html


if os.path.exists(frontend_build_dir):
    
    # 1. ROTA DE FALLBACK EXPLÍCITA PARA O SPA
    # Esta rota usa o path converter "path" para capturar qualquer rota (ex: /login)
    # que não foi tratada pelas rotas da API.
    # Coloque esta rota ANTES da montagem do StaticFiles.
    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa_index(full_path: str):
        # Heurística: se o caminho contém um ponto (.), assume-se que é um asset (js, css, png)
        # e deve ser tratado pelo StaticFiles abaixo.
        if "." in full_path:
            # Se for um asset, levantamos uma exceção 404. Isso é crucial para evitar que a função 
            # retorne implicitamente 'None', o que Starlette interpreta como um corpo 'null' com 
            # MIME type 'application/json', causando o erro no navegador. 
            # Ao levantar 404, o controle passa para o próximo manipulador de rotas (o StaticFiles mount).
            raise HTTPException(status_code=404)

        # Caso contrário, é uma rota de navegação do cliente (SPA, ex: /login) e deve retornar index.html.
        if os.path.exists(frontend_index_path):
            # O FileResponse garantirá o MIME type correto (text/html).
            return FileResponse(frontend_index_path)
        
        # Se não for asset e o index.html não for encontrado, retornamos 404 final.
        raise HTTPException(status_code=404, detail="Página não encontrada.")
        
    # 2. SERVIR ATIVOS ESTÁTICOS
    # O StaticFiles é o fallback final que lida com todos os assets (JS, CSS, imagens).
    # Ele será executado quando a rota explícita acima levantar HTTPException(404).
    app.mount(
    "/", 
    StaticFiles(directory=frontend_build_dir), 
    name="frontend"
  )
#  print(f"✅ Servindo frontend de: {frontend_build_dir}")
