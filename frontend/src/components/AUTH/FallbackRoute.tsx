import React from "react";
import { Navigate } from "react-router-dom";
import useAuthService from "./AuthForm.service";

const FallbackRoute: React.FC = () => {
  const { user, loadingUser } = useAuthService();

  if (loadingUser) return <p>Carregando...</p>;

  if (user) return <Navigate to="/" replace />;

  
  return <Navigate to="/login" replace />;
};

export default FallbackRoute;
