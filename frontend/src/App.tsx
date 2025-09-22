//
// Arquivo: frontend/src/App.tsx (VERSÃO ATUALIZADA)
//
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

// --- MUDANÇA 1: Importar a nova página da Frota ---
import ListaVeiculosPage from './frota/pages/ListaVeiculosPage';


function App() {
  return (
    <Router>
      <Routes>
        {/* Rota pública de Login */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <AuthForm />
            </PublicRoute>
          }
        />

        {/* A rota principal "/" agora é a página de seleção */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* Rota do sistema de tickets */}
        <Route
          path="/tickets/*" // Usar "/*" aqui é uma boa prática para rotas aninhadas
          element={
            <ProtectedRoute>
              <DashboardLayoutRoute />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} /> {/* Rota padrão para /tickets */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="create-ticket" element={<CreateTicketForm/>} />
          <Route path="tickets" element={<TicketsPage/>} />
          <Route path="assigned" element={<TicketsPage/>} />
          <Route path="manage-users" element={<ManagerUser/>} />
          <Route path="settings" element={<ConfigsPage/>} />
          <Route path="tickets/:ticketId" element={<TicketDetail/>} />
        </Route>

        {/* --- MUDANÇA 2: Nova rota para o sistema de frotas --- */}
        {/* Trocamos o placeholder FrotasSystem pela sua página real */}
        <Route
          path="/frotas"
          element={
            <ProtectedRoute>
              {/* No futuro, podemos criar um DashboardLayout para a frota também */}
              <ListaVeiculosPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<FallbackRoute />} />
      </Routes>
    </Router>
  );
}

export default App;