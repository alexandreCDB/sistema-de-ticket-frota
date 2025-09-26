import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loadingUser } = useAuth();

  if (loadingUser) {
    return (
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <p>Carregando usuário...</p>
      </div>
    );
  }

  if (!user) {
    console.log("Usuário não autenticado, redirecionando para /login");
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
