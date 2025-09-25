import React, { useState } from "react";
import { LayoutDashboard, Users, Settings, RefreshCw } from "lucide-react";
import { useSystemStats } from "../../hooks/useSystemStats";
import { useUsers } from "../../hooks/useUsers";
import DashboardTab from "./../../components/DashboardTab/DashboardTab";
import UsersTab from "./../../components/UsersTab/UsersTab";
import SettingsTab from "./../../components/SettingsTab/SettingsTab";
//@ts-ignore
import "./AdminDashboard.css";
import { User } from "../../types";
import { useDashboardStats } from "./AdminDashboard.service";

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { systemStats, updateStats } = useSystemStats();
  const { stats, users } = useDashboardStats();
  // const { users } = useUsers();
  const [users2, setUsers] = useState<User[]>([
    { id: 1, name: 'João Silva', email: 'joao@email.com', status: 'online', lastSeen: 'Agora', role: 'Admin' },
    { id: 2, name: 'Maria Santos', email: 'maria@email.com', status: 'online', lastSeen: 'Agora', role: 'User' },
    { id: 3, name: 'Pedro Costa', email: 'pedro@email.com', status: 'offline', lastSeen: '5 min atrás', role: 'User' },
    { id: 4, name: 'Ana Oliveira', email: 'ana@email.com', status: 'online', lastSeen: 'Agora', role: 'Moderator' },
  ]);

  const onlineUsersCount = users.filter((u) => u.status === "online").length;
  console.log('stats', stats);
  
  return (
    <div className="admin-dashboard">
      <header className="top-bar">
        <div className="logo-section">
          <LayoutDashboard className="icon" />
          <h1>Admin Dashboard</h1>
        </div>
      </header>

      <div className="main-container">
        <nav className="side-nav">
          <button onClick={() => setActiveTab("dashboard")} className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}>
            <LayoutDashboard className="icon" /> <span>Dashboard</span>
          </button>
          <button onClick={() => setActiveTab("users")} className={`nav-item ${activeTab === "users" ? "active" : ""}`}>
            <Users className="icon" /> <span>Users</span>
            <span className="badge">{onlineUsersCount}</span>
          </button>
          <button onClick={() => setActiveTab("settings")} className={`nav-item ${activeTab === "settings" ? "active" : ""}`}>
            <Settings className="icon" /> <span>Settings</span>
          </button>
        </nav>

        <main className="content">
          <div className="content-header">
            <h2>
              {activeTab === "dashboard"
                ? "Dashboard Overview"
                : activeTab === "users"
                ? "Manage Users"
                : "Settings"}
            </h2>
            {activeTab === "dashboard" && (
              <button className="button secondary" onClick={updateStats}>
                <RefreshCw className="icon" />
                Refresh
              </button>
            )}
            {activeTab === "users" && (
              <span className="online-info">
                {onlineUsersCount} of {users.length} users online
              </span>
            )}
          </div>

          {activeTab === "dashboard" && <DashboardTab stats={stats} user={users2} />}
          {activeTab === "users" && <UsersTab />}
          {activeTab === "settings" && <SettingsTab />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
