import React from "react";
import { Navigate } from "react-router-dom";
import useAuthService from "./AuthForm.service";
import Loading from "../Loads/Loading";

const FallbackRoute: React.FC = () => {
  const { user, loadingUser } = useAuthService();

  if (loadingUser) return <Loading />;

  if (user) return <Navigate to="/" replace />;

  
  return <Navigate to="/login" replace />;
};

export default FallbackRoute;
