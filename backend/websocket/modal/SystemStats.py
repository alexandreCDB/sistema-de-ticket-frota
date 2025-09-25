from pydantic import BaseModel

class SystemStats(BaseModel):
    cpu: float
    memory: float
    disk: float
    connections: int
    uptime: str
