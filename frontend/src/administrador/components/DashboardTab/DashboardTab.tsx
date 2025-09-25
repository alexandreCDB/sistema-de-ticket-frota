import React from "react";
import DashboardContent from "./../DashboardContent/DashboardContent";
import { SystemStats, User } from "../../types";

const DashboardTab: React.FC<{ stats: SystemStats,user:User[] }> = ({ stats,user }) => {
  return <DashboardContent stats={stats} users={user} />;
};

export default DashboardTab;
