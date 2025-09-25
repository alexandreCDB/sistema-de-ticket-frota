import { useState, useEffect } from "react";
import { SystemStats, User } from "../../types";
import { connectWebSocket, getWebSocket } from "../../../services/websocket";

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
          setStats(data.message);
        }

        // Atualiza usuários se for do tipo users_update
        if (data.type === "users_update") {
          setUsers(data.message);
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
