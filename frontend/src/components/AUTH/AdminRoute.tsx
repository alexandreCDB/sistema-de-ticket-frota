import { Navigate } from "react-router-dom";
import { useAuth } from "../../tickets/services/App.services";
import { JSX } from "react";

export default function AdminRoute({ children }: { children: JSX.Element }) {
  const { user, loadingUser } = useAuth();

  if (loadingUser) return <p>A carregar...</p>;

  if (!user || (!user.is_admin && !user.is_super_admin)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
