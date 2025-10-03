import { Navigate } from "react-router-dom";
import { JSX } from "react";
import { useAuth } from "./AuthContext";

export default function AdminRoute({ children }: { children: JSX.Element }) {
  const { user, loadingUser } = useAuth();

  if (loadingUser) return <p>A carregar...</p>;

  if (!user || (!user.is_admin && !user.is_super_admin)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
