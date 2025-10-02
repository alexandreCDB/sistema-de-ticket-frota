
import { useState, useEffect } from 'react';
import { FaTicketAlt, FaSyncAlt, FaCheckCircle, FaClipboardList } from 'react-icons/fa';
import "./DashboardPanels.css";
import AnimatedPageWrapper from '../../../components/Animated/AnimatedPageWrapper';

const Panel = ({ title, value, icon, color }) => {
  return (
    <AnimatedPageWrapper>
    <div className="dashboard-panel" style={{ backgroundColor: color }}>
      <div className="panel-icon">{icon}</div>
      <div className="panel-content">
        <div className="panel-title">{title}</div>
        <div className="panel-value">{value}</div>
      </div>
    </div>
    </AnimatedPageWrapper>
  );
};
 
const DashboardPanels = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError("Token de autenticação não encontrado.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/ticket/tickets/stats/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Falha ao buscar as estatísticas do dashboard.');
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error("Erro ao buscar estatísticas:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Erro: {error}</p>;
  }
  
  // Lógica de renderização condicional dos painéis com base no tipo de usuário
  const renderPanels = () => {
    // USUARIO COMUM
    if (!user?.is_admin && !user?.is_super_admin) {
      return (
        <>
          <Panel 
            title="Tickets Abertos" 
            value={stats.open_tickets || 0} 
            icon={<FaTicketAlt />} 
            color="#007bff" 
          />
          <Panel 
            title="Tickets Em Andamento" 
            value={stats.in_progress_tickets || 0} 
            icon={<FaSyncAlt />} 
            color="#ffc107" 
          />
          <Panel 
            title="Tickets Fechados" 
            value={stats.closed_tickets || 0} 
            icon={<FaCheckCircle />} 
            color="#28a745" 
          />
          <Panel 
            title="Total de Tickets" 
            value={stats.total_created_by_me || 0} 
            icon={<FaClipboardList />} 
            color="#6c757d" 
          />
        </>
      );
    }
    
    // TECNICO (is_admin)
    if (user?.is_admin && !user?.is_super_admin) {
      return (
        <>
          <Panel 
            title="Abertos" 
            value={stats.open_tickets_assigned_to_me || 0} 
            icon={<FaTicketAlt />} 
            color="#007bff" 
          />
          <Panel 
            title="Em Andamento" 
            value={stats.in_progress_tickets_all || 0} 
            icon={<FaSyncAlt />} 
            color="#ffc107" 
          />
          <Panel 
            title="Fechados" 
            value={stats.closed_by_me || 0} 
            icon={<FaCheckCircle />} 
            color="#28a745" 
          />
          <Panel 
            title="Resolvidos" 
            value={stats.total_resolved_all_techs || 0} 
            icon={<FaClipboardList />} 
            color="#6c757d" 
          />
        </>
      );
    }

    // ADMIN/TECNICO (is_super_admin)
    if (user?.is_super_admin) {
      return (
        <>
          <Panel 
            title="Abertos (Geral)" 
            value={stats.open_tickets_all_techs || 0} 
            icon={<FaTicketAlt />} 
            color="#007bff" 
          />
          <Panel 
            title="Em Andamento" 
            value={stats.in_progress_tickets_all || 0} 
            icon={<FaSyncAlt />} 
            color="#ffc107" 
          />
          <Panel 
            title="Fechados (Geral)" 
            value={stats.closed_tickets_all || 0} 
            icon={<FaCheckCircle />} 
            color="#28a745" 
          />
          <Panel 
            title="Resolvidos (Total)" 
            value={stats.total_resolved_all_techs || 0} 
            icon={<FaClipboardList />} 
            color="#6c757d" 
          />
        </>
      );
    }

    return null; // Retorna nulo se o usuário não se encaixar em nenhuma das categorias
  };

  return (
    <div className="dashboard-content">
      {/* Card de Boas-Vindas */}
      <div className="card welcome-card">
        <div className="card-header">
          <h2 className="card-title">Bem-vindo ao Ticket Doce Brinquedo!</h2>
        </div>
        <div className="card-content">
          <p>Use a navegação na barra lateral para criar novos tickets, visualizar os existentes ou gerenciar suas configurações. Este painel oferece uma visão geral de suas operações de suporte.</p>
        </div>
      </div>

      {/* Título para os painéis de estatísticas */}
      <h2 className="section-title">Estatísticas de Tickets</h2>
      <div className="panels-container">
        {renderPanels()}
      </div>
    </div>
  );

  
};

export default DashboardPanels;

// // frontend/src/components/DashboardPanels.jsx
// import { useState, useEffect } from 'react';
// import { FaTicketAlt, FaSyncAlt, FaCheckCircle, FaClipboardList } from 'react-icons/fa';
// import './DashboardPanels.css'; // Vamos criar este arquivo de CSS a seguir
// import AnimatedPageWrapper from '../../../components/Animated/AnimatedPageWrapper';


// const Panel = ({ title, value, icon, color }) => {
//   return (
//     <AnimatedPageWrapper>
//     <div className="dashboard-panel" style={{ backgroundColor: color }}>
//       <div className="panel-icon">{icon}</div>
//       <div className="panel-content">
//         <div className="panel-title">{title}</div>
//         <div className="panel-value">{value}</div>
//       </div>
//     </div>
//     </AnimatedPageWrapper>
//   );
// };
 
// const DashboardPanels = ({ user }) => {
//   const { stats, loading, error } = useDashboardStats();
//   const panels = getPanelsForUser(user, stats);

//   if (loading) return <p>Carregando estatísticas...</p>;
//   if (error) return <p style={{ color: 'red' }}>Erro: {error}</p>;

//   return (
//     <div className="dashboard-content">
//       <div className="card welcome-card">
//         <div className="card-header">
//           <h2 className="card-title">Bem-vindo ao Ticket Doce Brinquedo!</h2>
//         </div>
//         <div className="card-content">
//           <p>Use a navegação na barra lateral para criar novos tickets, visualizar os existentes ou gerenciar suas configurações. Este painel oferece uma visão geral de suas operações de suporte.</p>
//         </div>
//       </div>

//       <h2 className="section-title">Estatísticas de Tickets</h2>
//       <div className="panels-container">
//         {panels.map((panel, idx) => (
//           <Panel key={idx} {...panel} />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default DashboardPanels;