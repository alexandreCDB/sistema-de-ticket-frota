import json
import os
from dotenv import load_dotenv
from fastapi import WebSocket
from jose import jwt, JWTError
from typing import List

from backend.core.security import decode_access_token

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

# backend/connection_manager.py
class ConnectionManager:
    def __init__(self):
        # Cada user_id pode ter várias conexões (multi-aba, multi-device)
        self.active_connections: dict[int, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, token: str):
        try:
            payload = decode_access_token(token)
            print("Payload JWT:", payload)  # para depuração
            user_id: int = int(payload.get("user_id") or payload.get("sub"))
            if user_id is None:
                await websocket.close(code=1008)
                raise Exception("Usuário inválido")
        except ValueError:
            await websocket.close(code=1008)
            return

        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        print(f"🔗 Cliente conectado: {user_id}")

    async def connect_OLD(self, websocket: WebSocket, token: str):
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id: int = payload.get("user_id")  # <<-- guarde o ID no JWT
            if user_id is None:
                raise Exception("Usuário inválido")
        except JWTError:
            await websocket.close(code=1008)
            return

        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        print(f"🔗 Cliente conectado: {user_id}")

    def disconnect(self, websocket: WebSocket):
        for user_id, conns in list(self.active_connections.items()):
            if websocket in conns:
                conns.remove(websocket)
                if not conns:
                    del self.active_connections[user_id]
                print(f"❌ Cliente {user_id} desconectado")
                break

    async def send_to_user(self, user_id: int,type:str, message: str):
        
        """Envia notificação só para o usuário específico"""
        if user_id in self.active_connections:
            for conn in self.active_connections[user_id]:
                print(f"Enviando mensagem para usuário {user_id}: {message}")
                await conn.send_text(json.dumps(self.set_msg(type, message)))

    async def broadcast(self, type:str, message: str):
        for conns in self.active_connections.values():
            for conn in conns:
                await conn.send_text(json.dumps(self.set_msg(type, message)))
                
    def set_msg(self, type:str, message: str):
        return {
                "type": type,
                "message": message
            }

