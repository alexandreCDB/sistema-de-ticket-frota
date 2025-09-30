import { useState, useEffect } from "react";
import { SystemStats, User } from "../../types";
import { connectWebSocket, getWebSocket } from "../../../services/websocket";
import { IUser } from "../../../components/AUTH/interfaces/user";
//@ts-ignore
const API_URL = import.meta.env.VITE_API_URL;


export const useDashboardStats = () => {
  const [stats, setStats] = useState<SystemStats>({
    cpu: { percent: 0 },
    memory: { total: 0, used: 0, percent: 0 },
    disk: { total: 0, used: 0, percent: 0 },
    connections: 0,
    uptime: "0s",
  });

  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Conecta ao WS usando o módulo
    const ws = getWebSocket() || connectWebSocket();

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        // Atualiza stats se for do tipo system_stats
        if (data.type === "system_stats") {
          setStats(data.message.server_stats);
          setUsers(data.message.users_stats);
          
        }
           
      } catch (err) {
      console.error("Erro ao processar mensagem WS:", err);
    }
  };

  ws.addEventListener("message", handleMessage);

  return () => {
    ws.removeEventListener("message", handleMessage);
    // opcional: não desconecta aqui se quiser manter reconexão automática
  };
}, []);

return { stats, users };
};

export const fetchUsers = async (): Promise<IUser[]> => {
  const response = await fetch(`${API_URL}/ticket/users/`, {
    credentials: 'include', 
  });

  if (!response.ok) {
    throw new Error('Erro ao buscar usuários');
  }

  const data = await response.json();
  return Array.isArray(data) ? data : data.users || [];
};

export const toggleUserActive = async (userId: number, isActive: boolean) => {
  const response = await fetch(`${API_URL}/ticket/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ is_active: !isActive }),
  });

  if (!response.ok) {
    throw new Error('Erro ao atualizar usuário');
  }

  return await response.json();
};
