import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthForm from "./components/AUTH/AuthForm";
import ProtectedRoute from "./components/AUTH/ProtectedRoute";
import PublicRoute from "./components/AUTH/PublicRoute";
import DashboardLayoutRoute from "./tickets/pages/deshboard-panel/DashboardLayoutRoute";
import FallbackRoute from "./components/AUTH/FallbackRoute";
import Dashboard from "./tickets/pages/deshboard-panel/Dashboard";
import Home from "./Pages/home"; 
import CreateTicketForm from "./tickets/pages/create-ticket-form/CreateTicketForm";
import TicketsPage from "./tickets/pages/ticket-page/TicketsPage";
import TicketDetail from "./tickets/components/ticket-detail/TicketDetail";
import ConfigsPage from "./tickets/pages/configs/ConfigsPage";
import ManagerUser from "./tickets/pages/manager-user/manager-user";
import FrotaAdminPage from './frota/components/FrotaAdminPage/index';
import ListaVeiculosPage from './frota/pages/ListaVeiculosPage';
import MeusVeiculosPage from './frota/pages/MeusVeiculosPage/index';
import { useAuth } from './tickets/services/App.services';
import AdminDashboard from "./administrador/pages/main/AdminDashboard";
import { Navigate } from "react-router-dom";

// Wrapper para rotas de admin
function AdminRoute({ children }: { children: JSX.Element }) {
  const { user, loadingUser } = useAuth();

  if (loadingUser) return <p>Carregando...</p>; // espera carregar o user

  if (!user?.is_admin && !user?.is_super_admin) {
    return <Navigate to="/" replace />; // não é admin → redireciona para home
  }

  return children;
}

function App() {
  const { loadingUser } = useAuth();

  if (loadingUser) {
    return <p>A carregar aplicação...</p>;
  }

  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<PublicRoute><AuthForm /></PublicRoute>} />

        {/* Home */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />

        {/* Tickets */}
        <Route path="/tickets/*" element={<ProtectedRoute><DashboardLayoutRoute /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="create-ticket" element={<CreateTicketForm />} />
          <Route path="tickets" element={<TicketsPage />} />
          <Route path="assigned" element={<TicketsPage />} />
          <Route path="manage-users" element={<ManagerUser />} />
          <Route path="settings" element={<ConfigsPage />} />
          <Route path="tickets/:ticketId" element={<TicketDetail />} />
        </Route>

        {/* Frota */}
        <Route path="/frotas">
          <Route index element={<ProtectedRoute><ListaVeiculosPage /></ProtectedRoute>} />
          <Route path="meus-veiculos" element={<ProtectedRoute><MeusVeiculosPage /></ProtectedRoute>} />
          <Route path="admin" element={
            <ProtectedRoute>
              <AdminRoute>
                <FrotaAdminPage />
              </AdminRoute>
            </ProtectedRoute>
          } />
        </Route>

        {/* Painel Master/Admin */}
        <Route path="/master/*" element={
          <ProtectedRoute>
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          </ProtectedRoute>
        } />

        {/* Catch-all */}
        <Route path="*" element={<FallbackRoute />} />
      </Routes>
    </Router>
  );
}

export default App;
