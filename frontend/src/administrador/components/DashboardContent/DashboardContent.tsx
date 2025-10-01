import React from "react";
import StatsCard from "./../StatsCard/StatsCard";
import { Cpu, HardDrive, Database, Activity, Users } from "lucide-react";
import { SystemStats, User } from "../../types";

interface DashboardContentProps {
  stats: SystemStats;
  users: User[];
}

const DashboardContent: React.FC<DashboardContentProps> = ({ stats, users }) => (
  <div className="dashboard-content">
    <div className="stats-grid">
      {/* CPU */}
      <StatsCard
        label="CPU Usage"
        value={`${stats.cpu.percent.toFixed(1)}%`}
        icon={<Cpu />}
        progress={stats.cpu.percent}
        color="blue"
      />

      {/* Memory */}
      <StatsCard
        label="Memory"
        value={`${stats.memory.used.toFixed(1)} / ${stats.memory.total.toFixed(1)} GB (${stats.memory.percent.toFixed(1)}%)`}
        icon={<HardDrive />}
        progress={stats.memory.percent}
        color="green"
      />

      {/* Disk */}
      <StatsCard
        label="Disk Usage"
        value={`${stats.disk.used.toFixed(1)} / ${stats.disk.total.toFixed(1)} GB (${stats.disk.percent.toFixed(1)}%)`}
        icon={<Database />}
        progress={stats.disk.percent}
        color="purple"
      />

      {/* Connections */}
      <StatsCard
        label="Connections"
        value={stats.connections.toLocaleString()}
        icon={<Activity />}
        subtitle={`Uptime: ${stats.uptime}`}
        color="orange"
      />
    </div>

    <section className="gruop">
      <div className="quick-stats">
        <div className="stat-card">
          <h3>
            <Users className="icon" />
            Usuários Online
          </h3>
          <div className="space-y-3">
            {users.filter(user => user.status === 'online').slice(0, 5).map(user => (
              <div key={user.id} className="user-item">
                <div className="status-dot"></div>
                <div className="suser-info">
                  <strong style={{color:"black"}}>{user.name.split("@")[0].replace(/\./g, " ").toLocaleUpperCase()}</strong>
                  <p>{user.email}</p>
                </div>
                <span className="user-role">{getUserRole(user)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="system-activity-card">
        <h3>
          <Activity className="icon" />
          Atividade do Sistema
        </h3>
        <div className="space-y-3">
          <div className="activity-item activity-blue">
            <div className="status-dot"></div>
            <span className="activity-text">Sistema iniciado com sucesso</span>
            <span className="activity-time">2 min atrás</span>
          </div>
          <div className="activity-item activity-green">
            <div className="status-dot"></div>
            <span className="activity-text">Backup automático concluído</span>
            <span className="activity-time">15 min atrás</span>
          </div>
          <div className="activity-item activity-yellow">
            <div className="status-dot"></div>
            <span className="activity-text">Atualização de segurança aplicada</span>
            <span className="activity-time">1 hora atrás</span>
          </div>
          <div className="activity-item activity-purple">
            <div className="status-dot"></div>
            <span className="activity-text">Novo usuário registrado</span>
            <span className="activity-time">2 horas atrás</span>
          </div>
        </div>
      </div>
    </section>
  </div>


);

export default DashboardContent;

export const getUserRole = (user: any) => {
  if (user.is_super_admin) return "Super Admin";
  if (user.is_admin) return "Admin";
  return "Normal";
}