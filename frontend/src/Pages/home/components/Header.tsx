import React, { useState } from 'react';
import { User, ChevronDown } from 'lucide-react';
//@ts-ignore
import './../styles/header.css';
import UserDropdown from './UserDropdown';

interface HeaderProps {
  userName?: string;
  userEmail?: string;
}

const Header: React.FC<HeaderProps> = ({
  userName = "Padrão",
  userEmail = "pd@dc.com"
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);


  const user = localStorage.getItem("user_current");
  if (user) {
    userEmail = user; // email completo
    userName = user.split("@")[0].replace(/\./g, " "); // parte antes do @, troca ponto por espaço
  }




  return (
    <header className="header">
      <div className="header-container">
        {/* Logo e Nome da Empresa */}
        <div className="header-brand">
          <div className="header-logo">
            <span>SI</span>
          </div>
          <div className="header-title">
            <h1>Sistema Integrado</h1>
            <p className="header-subtitle">Gestão Empresarial</p>
          </div>
        </div>

        {/* Menu do Usuário */}
        <div className="user-menu">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="user-button"
          >
            <div className="user-info">
              <p className="user-name">{userName}</p>
              <p className="user-email">{userEmail}</p>
            </div>
            <div className="user-avatar">
              <User size={18} />
            </div>
            <ChevronDown
              size={16}
              className={`chevron-icon ${isDropdownOpen ? 'rotated' : ''}`}
            />
          </button>

          <UserDropdown
            isOpen={isDropdownOpen}
            onClose={() => setIsDropdownOpen(false)}
            userName={userName}
            userEmail={userEmail}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;