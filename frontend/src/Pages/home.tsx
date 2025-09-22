//
// Arquivo: frontend/src/Pages/home.tsx
//
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Truck } from 'lucide-react';

// --- MUDANÇA PRINCIPAL ---
// Importa o arquivo de estilo que criamos.
import './home.css';

const Home = () => {
  const navigate = useNavigate();

  const goToTickets = () => {
    navigate('/tickets');
  };

  const goToFrotas = () => {
    navigate('/frotas');
  };

  return (
    <div className="home-container">
      
      <div className="home-header">
        <h1>Bem-vindo ao Sistema Integrado</h1>
        <p>Por favor, selecione o módulo que deseja acessar.</p>
      </div>

      <div className="modules-container">
        
        {/* Card do Sistema de Tickets */}
        <div className="module-card" onClick={goToTickets}>
          <div className="module-icon icon-tickets">
            <ClipboardList size={64} />
          </div>
          <h2>Sistema de Tickets</h2>
          <p>
            Gerencie chamados, acompanhe solicitações e suporte técnico.
          </p>
        </div>

        {/* Card do Sistema de Frotas */}
        <div className="module-card" onClick={goToFrotas}>
          <div className="module-icon icon-frotas">
            <Truck size={64} />
          </div>
          <h2>Controle de Frota</h2>
          <p>
            Agende e gerencie a utilização dos veículos da empresa.
          </p>
        </div>

      </div>
    </div>
  );
};

export default Home;