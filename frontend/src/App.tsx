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
import FrotaAdminPage from './frota/components/FrotaAdminPage/index';
import ListaVeiculosPage from './frota/pages/ListaVeiculosPage';
import MeusVeiculosPage from './frota/pages/MeusVeiculosPage/index';
import AdminDashboard from "./administrador/pages/main/AdminDashboard";
import NotificationBell from "./components/notification-bell/NotificationBell";
import AdminRoute from "./components/AUTH/AdminRoute";
import Home from "./Pages/home/home";
import Loading from "./components/Loads/Loading";
import { useAuth } from "./components/AUTH/AuthContext";
import TicketDeprecatedPage from "./tickets/TicketDeprecatedPage";

function AppContent() {
  // const { loadingUser, user } = useAuth();
  const location = useLocation();

  // if (loadingUser) {
  //   return <Loading />;
  // }

  return (
    <>
      {location.pathname !== "/login" && <NotificationBell />}

      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <AuthForm />
            </PublicRoute>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tickets/*"
          element={
           <TicketDeprecatedPage/>
            // <ProtectedRoute>
            //   <DashboardLayoutRoute />
            // </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="create-ticket" element={<CreateTicketForm />} />
          <Route path="tickets" element={<TicketsPage />} />
          <Route path="assigned" element={<TicketsPage />} />
          <Route path="tickets/:ticketId" element={<TicketDetail />} />
        </Route>

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

        <Route path="/master/*">
          <Route index element={<AdminRoute>
            <AdminDashboard />
          </AdminRoute>
          } />
        </Route>

        <Route path="*" element={<FallbackRoute />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AppContent />
  );
}
