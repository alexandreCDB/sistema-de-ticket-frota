import React from "react";
import { Navigate } from "react-router-dom";
// CORREÇÃO: Importando o hook correto do Contexto de Autenticação
import { useAuth } from "./AuthContext"; 
import Loading from "../Loads/Loading";

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  // CORREÇÃO: Usando o hook correto que tem o estado global do usuário
  const { user, loadingUser } = useAuth();

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