import React from "react";
import { Navigate } from "react-router-dom";
import useAuthService from "./AuthForm.service";

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user, loadingUser } = useAuthService();

  if (loadingUser) {
    return <p>Carregando...</p>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
