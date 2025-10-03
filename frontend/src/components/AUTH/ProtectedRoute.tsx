import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Loading from "../Loads/Loading";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loadingUser } = useAuth();

  // 1. Primeiro, espera o carregamento terminar
  if (loadingUser) {
    return <Loading />;
  }

  // 2. Depois do carregamento, verifica se existe um usuário
  if (!user) {
    // Se não houver, redireciona para o login
    return <Navigate to="/login" replace />;
  }

  // 3. Se houver usuário, renderiza a página protegida
  return <>{children}</>;
};

export default ProtectedRoute;