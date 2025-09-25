import psutil
from datetime import timedelta
from backend.websocket.service.ws_instance import manager

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

