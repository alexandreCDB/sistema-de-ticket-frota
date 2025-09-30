import psutil
from datetime import timedelta
# from backend.frota.database import SessionLocal
from backend.database.database import SessionLocal
from backend.models.user import User
from backend.websocket.service.ws_instance import manager
from sqlalchemy.orm import Session


import psutil
from datetime import timedelta

def get_system_stats() -> dict:
    # CPU
    cpu_percent = psutil.cpu_percent()

    # Memória
    mem = psutil.virtual_memory()
    memory_total = mem.total / (1024 ** 3)      # GB
    memory_used = mem.used / (1024 ** 3)        # GB
    memory_percent = mem.percent               # percentual usado

    # Disco
    disk = psutil.disk_usage("/")
    disk_total = disk.total / (1024 ** 3)      # GB
    disk_used = disk.used / (1024 ** 3)        # GB
    disk_percent = disk.percent                # percentual usado

    # Conexões e uptime
    connections = len(manager.active_connections)
    uptime = str(timedelta(seconds=int(psutil.boot_time())))

    return {
        "cpu": {"percent": cpu_percent},
        "memory": {"total": round(memory_total, 2), "used": round(memory_used, 2), "percent": memory_percent},
        "disk": {"total": round(disk_total, 2), "used": round(disk_used, 2), "percent": disk_percent},
        "connections": connections,
        "uptime": uptime
    }


async def get_online_users_data():
    """Retorna os usuários online diretamente do DB (síncrono)."""
    online_ids = list(manager.active_connections.keys())
    users_data = []

    db = SessionLocal()  # cria sessão manualmente
    try:
        users_online = db.query(User).filter(User.id.in_(online_ids)).all()
        users_data = [
            {"id": user.id, "name": user.email, "email": user.email, "is_admin": user.is_admin, "is_super_admin": user.is_super_admin, "status": "online"}
            for user in users_online
        ]
    except Exception as e:
        print("Erro ao buscar usuários online:", e)
    finally:
        db.close()

    return users_data