import React, { useState } from "react";
import { LayoutDashboard, Users, Settings, RefreshCw, ArrowLeft } from "lucide-react";
import { useSystemStats } from "../../hooks/useSystemStats";
// import { useUsers } from "../../hooks/useUsers";
import DashboardTab from "./../../components/DashboardTab/DashboardTab";
import UsersTab from "./../../components/UsersTab/UsersTab";
import SettingsTab from "./../../components/SettingsTab/SettingsTab";
//@ts-ignore
import "./AdminDashboard.css";
import { User } from "../../types";
import { useDashboardStats } from "./AdminDashboard.service";
import { NavLink } from "react-router-dom";

const AdminDashboard: React.FC = () => {

  const [activeTab, setActiveTab] = useState("dashboard");
  const { stats, users } = useDashboardStats();



  const onlineUsersCount = users.filter((u) => u.status === "online").length;

  return (
    <div className="la-admin-dashboard">
      <div className="la-main-container">

        <nav className="la-side-nav">


       <NavLink to="/" end>
          <button onClick={() => setActiveTab("back")} className={`la-nav-item ${activeTab === "back" ? "active" : "back"}`}>
            <ArrowLeft  className="la-icon" style={{color:"blue"}} /> <span>Voltar</span>
          </button> </NavLink>
          <button onClick={() => setActiveTab("dashboard")} className={`la-nav-item ${activeTab === "dashboard" ? "active" : ""}`}>
            <LayoutDashboard className="la-icon" /> <span>Dashboard</span>
          </button>
          <button onClick={() => setActiveTab("users")} className={`la-nav-item ${activeTab === "users" ? "active" : ""}`}>
            <Users className="la-icon" /> <span>Users</span>
            <span className="la-badge">{onlineUsersCount}</span>
          </button>
          {/* <button onClick={() => setActiveTab("settings")} className={`la-nav-item ${activeTab === "settings" ? "active" : ""}`}>
            <Settings className="la-icon" /> <span>Settings</span>
          </button> */}
        <NavLink to="/" end>
          <button className="la-logout-button">VOLTAR</button>
        </NavLink>
        </nav>

        <main className="la-content">
          <div className="la-content-header">
            <h2>
              {activeTab === "dashboard"
                ? "Dashboard Overview"
                : activeTab === "users"
                  ? "Manage Users"
                  : "Settings"}
            </h2>

            {activeTab === "users" && (
              <span className="la-online-info">
                {onlineUsersCount} of {users.length} users online
              </span>
            )}
          </div>

          {activeTab === "dashboard" && <DashboardTab stats={stats} user={users} />}
          {activeTab === "users" && <UsersTab />}
          {/* {activeTab === "settings" && <SettingsTab />} */}
        </main>
      </div>
    </div>

    // <div className="admin-dashboard">
    //   <div className="main-container">
    //     <nav className="side-nav">
    //       <button onClick={() => setActiveTab("dashboard")} className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}>
    //         <LayoutDashboard className="icon" /> <span>Dashboard</span>
    //       </button>
    //       <button onClick={() => setActiveTab("users")} className={`nav-item ${activeTab === "users" ? "active" : ""}`}>
    //         <Users className="icon" /> <span>Users</span>
    //         <span className="badge">{onlineUsersCount}</span>
    //       </button>
    //       <button onClick={() => setActiveTab("settings")} className={`nav-item ${activeTab === "settings" ? "active" : ""}`}>
    //         <Settings className="icon" /> <span>Settings</span>
    //       </button>
    //       <NavLink
    //         to="/"
    //         end

    //       >
    //         <button
    //           // onClick={handleLogout} 
    //           className="logout-button">
    //           VOLTAR
    //         </button>
    //       </NavLink>
    //     </nav>

    //     <main className="content">
    //       <div className="content-header">
    //         <h2>
    //           {activeTab === "dashboard"
    //             ? "Dashboard Overview"
    //             : activeTab === "users"
    //               ? "Manage Users"
    //               : "Settings"}
    //         </h2>

    //         {activeTab === "users" && (
    //           <span className="online-info">
    //             {onlineUsersCount} of {users.length} users online
    //           </span>
    //         )}
    //       </div>

    //       {activeTab === "dashboard" && <DashboardTab stats={stats} user={users} />}
    //       {activeTab === "users" && <UsersTab />}
    //       {activeTab === "settings" && <SettingsTab />}

    //     </main>
    //   </div>
    // </div>
  );
};

export default AdminDashboard;
