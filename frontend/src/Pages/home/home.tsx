import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, ShieldCheck, Truck } from 'lucide-react';
//@ts-ignore
import './home.css';
import Header from './components/Header';
import { useAuth } from '../../components/AUTH/AuthContext';

const Home = () => {
  const navigate = useNavigate();

  const goToTickets = () => {
    navigate('/tickets');
  };

  const goToFrotas = () => {
    navigate('/frotas');
  };

  const goToMaster = () => {
    navigate('/master');
  };



  const { user } = useAuth();
  return (
    <div className="home-page">
      <Header />

      <main className="home-main">
        {/* Hero Section */}
        <div className="home-hero">
          <h1>Bem-vindo ao Sistema Integrado</h1>
          <p>
            Acesse os módulos do sistema para gerenciar tickets, controlar frotas e administrar configurações.
          </p>
        </div>

        {/* Modules Grid */}
        <div className="modules-grid">

          {/* Sistema de Tickets */}
          <div className="module-card" onClick={goToTickets}>
            <div className="module-icon tickets">
              <ClipboardList size={32} />
            </div>
            <h3 className="module-title">Sistema de Tickets</h3>
            <p className="module-description">
              Gerencie chamados, acompanhe solicitações e ofereça suporte técnico de forma eficiente.
            </p>
            <div className="module-link">
              Acessar módulo
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Sistema de Frotas */}
          <div className="module-card" onClick={goToFrotas}>
            <div className="module-icon frotas">
              <Truck size={32} />
            </div>
            <h3 className="module-title">Controle de Frota</h3>
            <p className="module-description">
              Agende e gerencie a utilização dos veículos da empresa de forma inteligente.
            </p>
            <div className="module-link">
              Acessar módulo
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Sistema Administrador */}
          {user && (user.is_admin || user.is_super_admin) && (
            <div className="module-card" onClick={goToMaster}>
              <div className="module-icon master">
                <ShieldCheck size={32} />
              </div>
              <h3 className="module-title">Administrador</h3>
              <p className="module-description">
                Acesse funções administrativas e configurações avançadas do sistema.
              </p>
              <div className="module-link">
                Acessar módulo
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          )}





        </div>
      </main>
    </div>
  );
};

export default Home;