// src/tickets/components/AUTH/ProtectedRoute.tsx

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../services/App.services"; // Importa o hook correto

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loadingUser } = useAuth();
  
  console.log("RODANDO PROTECTED ROUTE:", { user, loadingUser });

  if (loadingUser) {
    return <p>Carregando...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;