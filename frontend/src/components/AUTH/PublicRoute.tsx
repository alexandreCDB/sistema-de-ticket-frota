import React from "react";
import { Navigate } from "react-router-dom";
import useAuthService from "./AuthForm.service";
import Loading from "../Loads/Loading";

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user, loadingUser } = useAuthService();

  if (loadingUser) {
    return <Loading />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
