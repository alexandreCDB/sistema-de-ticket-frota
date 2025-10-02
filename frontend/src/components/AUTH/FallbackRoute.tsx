import React from "react";
import { Navigate } from "react-router-dom";
import Loading from "../Loads/Loading";
import { useAuth } from "./AuthContext";

const FallbackRoute: React.FC = () => {
  const { user, loadingUser } = useAuth();

  if (loadingUser) return <Loading />;

  if (user) return <Navigate to="/" replace />;

  
  return <Navigate to="/login" replace />;
};

export default FallbackRoute;
