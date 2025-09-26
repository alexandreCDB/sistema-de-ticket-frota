import { Navigate } from "react-router-dom";
import { useAuth } from "../../tickets/services/App.services";

export default function AdminRoute({ children }: { children: JSX.Element }) {
  const { user, loadingUser } = useAuth();

  if (loadingUser) return <p>A carregar...</p>;

  if (!user || !user.is_admin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
