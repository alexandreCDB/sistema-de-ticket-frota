import React from "react";
import { Navigate } from "react-router-dom";
import useAuthService from "./AuthForm.service";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loadingUser } = useAuthService();
  

  if (loadingUser) {
    return <p>Carregando...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
