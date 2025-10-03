import { ReactNode } from "react";
//@ts-ignore
import "./DashboardPanels.css";
import AnimatedPageWrapper from "../../../components/Animated/AnimatedPageWrapper";
import { getPanelsForUser, PanelConfig } from "./dashboardPanelsLogic";
import { useDashboardStats } from "./DashboardPanels.service";

import Loading from "../../../components/Loads/Loading";
import { useAuth } from "../../../components/AUTH/AuthContext";

interface PanelProps extends PanelConfig {}

const Panel = ({ title, value, icon, color }: PanelProps) => {
  return (
    <AnimatedPageWrapper>
      <div className="dashboard-panel" style={{ backgroundColor: color }}>
        <div className="panel-icon">{icon}</div>
        <div className="panel-content">
          <div className="panel-title">{title}</div>
          <div className="panel-value">{value}</div>
        </div>
      </div>
    </AnimatedPageWrapper>
  );
};

const Dashboard = () => {
  const { stats, loading, error } = useDashboardStats();
  const { user, loadingUser, userError } = useAuth();

  

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <p style={{ color: "red" }}>Erro: {error}</p>;
  }

  const panels = getPanelsForUser(user, stats);

  return (
    <div className="dashboard-content">
      {/* Card de Boas-Vindas */}
      <div className="title">
        <div className="card-header">
          <h2 className="card-title">Bem-vindo ao Ticket Doce Brinquedo!</h2>
        </div>
        <div className="card-content">
          <p>
            Use a navegação na barra lateral para criar novos tickets, visualizar
            os existentes ou gerenciar suas configurações. Este painel oferece
            uma visão geral de suas operações de suporte.
          </p>
        </div>
      </div>

      {/* Estatísticas */}
      <h2 className="section-title">Estatísticas de Tickets</h2>
      <div className="panels-container">
        {panels.map((panel: PanelConfig, index: number) => (
          <Panel
            key={index}
            title={panel.title}
            value={panel.value}
            icon={panel.icon}
            color={panel.color}
          />
        ))}
      </div>
    </div>
  );
};
export default Dashboard;



