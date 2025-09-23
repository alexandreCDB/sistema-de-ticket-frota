import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './styles.css';
import { Car, User, ShieldCheck } from 'lucide-react';
// Importa o hook de autenticação que já usamos
import { useAuth } from '../../../tickets/services/App.services';

export const FrotaHeader = () => {
  const location = useLocation();
  // Obtém os dados do utilizador logado
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="frota-header">
      <div className="frota-container header-content">
        <div className="logo-area">
          <Car size={32} />
          <div className="logo-text">
            <h1>Sistema de Frota</h1>
            <span>Doce Brinquedo</span>
          </div>
        </div>
        <nav className="navigation">
          <Link to="/frotas" className={`nav-link ${isActive('/frotas') ? 'active' : ''}`}>
            Ver Frota
          </Link>
          <Link to="/frotas/meus-veiculos" className={`nav-link ${isActive('/frotas/meus-veiculos') ? 'active' : ''}`}>
            Meus Veículos
          </Link>

          {/* --- NOVO LINK DE ADMIN CONDICIONAL --- */}
          {/* Este link só aparece se user.is_admin for verdadeiro */}
          {user?.is_admin && (
            <Link to="/frotas/admin" className={`nav-link admin-link ${isActive('/frotas/admin') ? 'active' : ''}`}>
              <ShieldCheck size={16} />
              Admin
            </Link>
          )}
        </nav>
        <div className="user-area">
          <User size={24} />
        </div>
      </div>
    </header>
  );
};