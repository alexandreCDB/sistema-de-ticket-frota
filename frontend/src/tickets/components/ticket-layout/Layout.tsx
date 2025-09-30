// frontend/src/components/Layout.tsx
import React, { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
//@ts-ignore
import './Layout.css';
import {
  FaTicketAlt,
  FaPlusSquare,
  FaListAlt,
  FaUsers,
  FaCog,
  FaTachometerAlt,
} from 'react-icons/fa';
import AnimatedPageWrapper from '../../../components/Animated/AnimatedPageWrapper';
//@ts-ignore
import boa from '../../../assets/logo.png';

// Definindo a tipagem do usuário
interface User {
  id: number;
  email: string;
  is_admin: boolean;
  is_super_admin: boolean;
}

// Props do componente Layout
interface LayoutProps {
  children: ReactNode;
  user: User;
  handleLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, handleLogout }) => {
  const location = useLocation();

  const isNavLinkActive = (basePath: string) => {
    return location.pathname === basePath;
  };



  return (
    <AnimatedPageWrapper>
      <div className="layout-container">
        <aside className="sidebar">
          <div className="sidebar-header">
            <img className="logo-doce" src={boa} alt="Logo" />
            <p>Olá, {user?.email}!</p>
            <p>
              {user?.is_super_admin
                ? 'Super Admin'
                : user?.is_admin
                  ? 'Técnico/Admin'
                  : 'Usuário Padrão'}
            </p>
          </div>

          <nav className="sidebar-nav">
            <ul>
              <li>
                <NavLink
                  to="/tickets/dashboard"
                  end
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  <FaTachometerAlt className="icon" />
                  <span>Painel</span>
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/tickets/create-ticket"
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  <FaPlusSquare className="icon" />
                  <span>Abrir Chamado</span>
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/tickets/tickets?tab=my-active"
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  <FaListAlt className="icon" />
                  <span>Meus Chamados</span>
                </NavLink>
              </li>

              {(user?.is_admin || user?.is_super_admin) && (
                <>
                  <li>
                    <NavLink
                      to="/tickets/tickets?tab=assigned-active"
                      className={({ isActive }) => (isActive ? 'active' : '')}
                    >
                      <FaTicketAlt className="icon" />
                      <span>Chamados Recebidos</span>
                    </NavLink>
                  </li>
                  {user?.is_super_admin && (
                    <li>
                      <NavLink
                        to="/tickets/manage-users"
                        className={({ isActive }) => (isActive ? 'active' : '')}
                      >
                        <FaUsers className="icon" />
                        <span>Gerenciar Usuários</span>
                      </NavLink>
                    </li>
                  )}
                </>
              )}

              {/* <li>
                <NavLink
                  to="/tickets/settings"
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  <FaCog className="icon" />
                  <span>Configurações</span>
                </NavLink>
              </li> */}
            </ul>
          </nav>

          <NavLink
            to="/"
            end

          >
            <button
              // onClick={handleLogout} 
              className="logout-button">
              VOLTAR
            </button>
          </NavLink>
        </aside>

        <div className="header-bar">
          
        </div>

        <main className="main-content">{children}</main>
      </div>
    </AnimatedPageWrapper>
  );
};

export default Layout;
