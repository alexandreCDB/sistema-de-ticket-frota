import { useState, useEffect } from "react";

//@ts-ignore
const API_URL = import.meta.env.VITE_API_URL;

export interface DashboardStats {
  open_tickets?: number;
  in_progress_tickets?: number;
  closed_tickets?: number;
  total_created_by_me?: number;

  open_tickets_assigned_to_me?: number;
  in_progress_tickets_all?: number;
  closed_by_me?: number;
  total_resolved_all_techs?: number;

  open_tickets_all_techs?: number;
  closed_tickets_all?: number;
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const response = await fetch(`${API_URL}/ticket/tickets/stats/`, {
          method: "GET",
          headers,
          credentials: "include", // garante envio de cookies
        });

        if (!response.ok) {
          throw new Error("Falha ao buscar as estatísticas do dashboard.");
        }

        const data: DashboardStats = await response.json();
        setStats(data);
      } catch (err: any) {
        console.error("Erro ao buscar estatísticas:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
};
