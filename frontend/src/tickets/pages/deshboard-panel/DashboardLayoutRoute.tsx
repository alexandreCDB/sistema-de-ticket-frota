import React from "react";
import { Outlet } from "react-router-dom";
import useAuthService from "../../../components/AUTH/AuthForm.service";
import Layout from "../../components/ticket-layout/Layout";
import "./DashboardPanels.css";

const DashboardLayoutRoute: React.FC = () => {
  const { user, handleLogout } = useAuthService();

  if (!user) return null; 

  return (
    <Layout user={user} handleLogout={handleLogout}>
      <Outlet />
    </Layout>
  );
};

export default DashboardLayoutRoute;
