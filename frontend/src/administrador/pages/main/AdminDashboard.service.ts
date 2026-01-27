import { useState, useEffect } from "react";
import { SystemStats, User } from "../../types";
import { connectWebSocket, getWebSocket } from "../../../services/websocket";
import { IUser } from "../../../components/AUTH/interfaces/user";

const API_URL = import.meta.env.VITE_API_URL; // ex: http://localhost:8000/api

const getAuthHeaders = (extraHeaders: Record<string, string> = {}) => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = { ...extraHeaders };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

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
    const ws = getWebSocket() || connectWebSocket();

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "system_stats") {
          setStats(data.message.server_stats);
          setUsers(data.message.users_stats || []);
        }
      } catch (err) {
        console.error("Erro ao processar mensagem WS:", err);
      }
    };

    ws.addEventListener("message", handleMessage);
    return () => ws.removeEventListener("message", handleMessage);
  }, []);

  return { stats, users };
};

export const fetchUsers = async (): Promise<IUser[]> => {
  // 🔹 Corrigido: sem /api duplicado
  const response = await fetch(`${API_URL}/frota/admin/users/cnh/list`, {
    headers: getAuthHeaders(),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar usuários (incluindo CNH)");
  }

  const data = await response.json();
  return Array.isArray(data) ? data : data.users || [];
};

export const fetchVehicles = async () => {
  // 🔹 Corrigido: /frota (sem "s")
  const response = await fetch(`${API_URL}/frota/vehicles`, {
    headers: getAuthHeaders(),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar veículos");
  }

  return await response.json();
};

export const toggleUserActive = async (
  userId: number,
  isActive: boolean
): Promise<IUser> => {
  const response = await fetch(`${API_URL}/ticket/users/${userId}`, {
    method: "PUT",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    credentials: "include",
    body: JSON.stringify({ is_active: !isActive }),
  });

  if (!response.ok) {
    throw new Error("Erro ao atualizar usuário");
  }

  return await response.json();
};

export const saveCnhVencimento = async (
  userId: number,
  cnhVencimento: string | null
): Promise<any> => {
  const url = `${API_URL}/frota/admin/users/cnh`;
  const payload = { user_id: userId, cnh_vencimento: cnhVencimento };

  const response = await fetch(url, {
    method: "PUT",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorDetail = await response.json().catch(() => ({}));
    throw new Error(
      `Erro ao salvar CNH: ${errorDetail.detail || "Erro desconhecido"}`
    );
  }

  return await response.json();
};
