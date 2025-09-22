import { ReactNode } from "react";
import { FaTicketAlt, FaSyncAlt, FaCheckCircle, FaClipboardList } from "react-icons/fa";
import { DashboardStats } from "./DashboardPanels.service";
import { IUser } from "../../../components/AUTH/interfaces/user";
import useAuthService, { useAuth } from "../../services/App.services";
import "./DashboardPanels.css";

export interface PanelConfig {
  title: string;
  value: number;
  icon: ReactNode;
  color: string;
}

export const getPanelsForUser = (user:IUser, stats: DashboardStats | null): PanelConfig[] => {
  if (!stats) return [];


  if (!user?.is_admin && !user?.is_super_admin) {
    return [
      { title: "Tickets Abertos", value: stats.open_tickets || 0, icon: <FaTicketAlt />, color: "#007bff" },
      { title: "Tickets Em Andamento", value: stats.in_progress_tickets || 0, icon: <FaSyncAlt />, color: "#ffc107" },
      { title: "Tickets Fechados", value: stats.closed_tickets || 0, icon: <FaCheckCircle />, color: "#28a745" },
      { title: "Total de Tickets", value: stats.total_created_by_me || 0, icon: <FaClipboardList />, color: "#6c757d" },
    ];
  }

  // Técnico
  if (user?.is_admin && !user?.is_super_admin) {
    return [
      { title: "Abertos", value: stats.open_tickets_assigned_to_me || 0, icon: <FaTicketAlt />, color: "#007bff" },
      { title: "Em Andamento", value: stats.in_progress_tickets_all || 0, icon: <FaSyncAlt />, color: "#ffc107" },
      { title: "Fechados", value: stats.closed_by_me || 0, icon: <FaCheckCircle />, color: "#28a745" },
      { title: "Resolvidos", value: stats.total_resolved_all_techs || 0, icon: <FaClipboardList />, color: "#6c757d" },
    ];
  }

  // Super Admin
  if (user?.is_super_admin) {
    return [
      { title: "Abertos (Geral)", value: stats.open_tickets_all_techs || 0, icon: <FaTicketAlt />, color: "#007bff" },
      { title: "Em Andamento", value: stats.in_progress_tickets_all || 0, icon: <FaSyncAlt />, color: "#ffc107" },
      { title: "Fechados (Geral)", value: stats.closed_tickets_all || 0, icon: <FaCheckCircle />, color: "#28a745" },
      { title: "Resolvidos (Total)", value: stats.total_resolved_all_techs || 0, icon: <FaClipboardList />, color: "#6c757d" },
    ];
  }

  return [];
};
