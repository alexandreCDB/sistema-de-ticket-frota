  // frontend/src/components/Layout.jsx
  import { NavLink, useLocation } from 'react-router-dom';
  import './Layout.css';
  import { FaTicketAlt, FaPlusSquare, FaListAlt, FaUsers, FaCog, FaTachometerAlt } from 'react-icons/fa';
  import NotificationBell from '../notification-bell/NotificationBell';
  import React, { useEffect, useState } from 'react';
  import boa from '../../../assets/logo.png'
  import AnimatedPageWrapper from '../../../components/Animated/AnimatedPageWrapper'

  function Layout({ children, user, handleLogout }) {
    const location = useLocation();

    // Função para verificar se a rota base está ativa, independentemente do 'tab'
    const isNavLinkActive = (basePath) => {
      // Retorna true se a rota atual começar com o caminho base
      return location.pathname === basePath;
    };

    // Funções para definir a classe 'active'
    const isMyTicketsActive = () => {
      // 'Meus Chamados' está ativo se a rota for `/dashboard/tickets` e a tab começar com 'my-'
      return isNavLinkActive('/dashboard/tickets') && new URLSearchParams(location.search).get('tab')?.startsWith('my-');
    };

    const isAssignedTicketsActive = () => {
      // 'Chamados Recebidos' está ativo se a rota for `/dashboard/tickets` e a tab não for 'my-'
      return isNavLinkActive('/dashboard/tickets') && !new URLSearchParams(location.search).get('tab')?.startsWith('my-');
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
          ? "Super Admin"
          : user?.is_admin
          ? "Técnico/Admin"
          : "Usuário Padrão"}
      </p>
    </div>

    <nav className="sidebar-nav">
      <ul>
        <li>
  <NavLink to="/tickets/dashboard" end className={({ isActive }) => (isActive ? "active" : "")}>
    <FaTachometerAlt className="icon" />
    <span>Painel</span>
  </NavLink>
</li>

<li>
  <NavLink to="/tickets/create-ticket" className={({ isActive }) => (isActive ? "active" : "")}>
    <FaPlusSquare className="icon" />
    <span>Abrir Chamado</span>
  </NavLink>
</li>

<li>
  <NavLink
    to="/tickets/tickets?tab=my-active"
    className={({ isActive }) => (isActive ? "active" : "")}
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
        className={({ isActive }) => (isActive ? "active" : "")}
      >
        <FaTicketAlt className="icon" />
        <span>Chamados Recebidos</span>
      </NavLink>
    </li>
    {user?.is_super_admin && (
      <li>
        <NavLink
          to="/tickets/manage-users"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <FaUsers className="icon" />
          <span>Gerenciar Usuários</span>
        </NavLink>
      </li>
    )}
  </>
)}

<li>
  <NavLink
    to="/tickets/settings"
    className={({ isActive }) => (isActive ? "active" : "")}
  >
    <FaCog className="icon" />
    <span>Configurações</span>
  </NavLink>
</li>

      </ul>
    </nav>

    <button onClick={handleLogout} className="logout-button">
      Sair
    </button>
  </aside>

        <div className="header-bar">
          <NotificationBell userId={user.id} />
        </div>
        <main className="main-content">
          {children}
        </main>
      </div>
      </AnimatedPageWrapper>
    );
  }

  export default Layout;