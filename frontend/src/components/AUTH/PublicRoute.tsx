import React from "react";
import { Navigate } from "react-router-dom";
import Loading from "../Loads/Loading";
import { useAuth } from "./AuthContext";

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user, loadingUser } = useAuth();

  if (loadingUser) {
    return <Loading />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
