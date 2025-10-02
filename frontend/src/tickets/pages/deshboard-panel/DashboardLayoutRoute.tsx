import React from "react";
import { Outlet } from "react-router-dom";
import Layout from "../../components/ticket-layout/Layout";
//@ts-ignore
import "./DashboardPanels.css";
import { useAuth } from "../../../components/AUTH/AuthContext";

const DashboardLayoutRoute: React.FC = () => {
  const { user, handleLogout } = useAuth();

  if (!user) return null; 

  return (
    <Layout user={user} handleLogout={handleLogout}>
      <Outlet />
    </Layout>
  );
};

export default DashboardLayoutRoute;
