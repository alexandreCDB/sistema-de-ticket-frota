import React from "react";
import { Navigate } from "react-router-dom";
import useAuthService from "./AuthForm.service";
import Loading from "../Loads/Loading";
import { useAuth } from "./AuthContext";

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user, loadingUser } = useAuthService();

  if (loadingUser) {
    return <Loading />;
  }

  // Se o usuário já estiver logado, redireciona para a página principal
  if (user) {
    return <Navigate to="/" replace />;
  }

  // Se não estiver logado, mostra a página pública (ex: formulário de login)
  return <>{children}</>;
};

export default PublicRoute;