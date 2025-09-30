import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import AuthForm from "./components/AUTH/AuthForm";
import ProtectedRoute from "./components/AUTH/ProtectedRoute";
import PublicRoute from "./components/AUTH/PublicRoute";
import DashboardLayoutRoute from "./tickets/pages/deshboard-panel/DashboardLayoutRoute";
import FallbackRoute from "./components/AUTH/FallbackRoute";
import Dashboard from "./tickets/pages/deshboard-panel/Dashboard";
// import Home from "./Pages/home"; 
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
import NotificationBell from "./components/notification-bell/NotificationBell";
import AdminRoute from "./components/AUTH/AdminRoute"; 
import Home from "./Pages/home/home";

function AppContent() {
  const { loadingUser } = useAuth();
  const location = useLocation();

  if (loadingUser) {
    return <p>A carregar aplicação...</p>;
  }

  return (
    <>
      {/* Sino aparece em todas as rotas, menos no login */}
      {location.pathname !== "/login" && <NotificationBell />}

      <Routes>
        {/* Rotas públicas */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <AuthForm />
            </PublicRoute>
          }
        />

        {/* Home protegida */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        
        {/* Tickets */}
        <Route
          path="/tickets/*"
          element={
            <ProtectedRoute>
              <DashboardLayoutRoute />
            </ProtectedRoute>
          }
        >
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
          <Route
            index
            element={
              <ProtectedRoute>
                <ListaVeiculosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="meus-veiculos"
            element={
              <ProtectedRoute>
                <MeusVeiculosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <FrotaAdminPage />
                </AdminRoute>
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Super Admin */}
        <Route path="/master/*">
          <Route index element={<AdminDashboard />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<FallbackRoute />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
