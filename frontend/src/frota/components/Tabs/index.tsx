import React, { useState } from 'react';
import './styles.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Tab {
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode; // ✅ Ícone opcional
}

interface TabsProps {
  tabs: Tab[];
}

export const Tabs: React.FC<TabsProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [showMenu, setShowMenu] = useState(true);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
    setShowMenu(false); // No mobile, esconde o menu quando seleciona
  };

  const handleBackToMenu = () => {
    setShowMenu(true);
  };

  return (
    <div className="tabs-container">
      {/* MENU DE LISTA (MOBILE) & NAVEGAÇÃO HORIZONTAL (DESKTOP) */}
      <nav className={`tabs-nav ${!showMenu ? 'hidden-mobile' : ''}`}>
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            className={`tab-button ${index === activeTab ? 'active' : ''}`}
            onClick={() => handleTabClick(index)}
          >
            <div className="tab-label-wrapper">
              {tab.icon && <span className="tab-icon">{tab.icon}</span>}
              <span className="tab-text">{tab.label}</span>
            </div>
            <ChevronRight size={18} className="mobile-only-arrow" />
          </button>
        ))}
      </nav>

      {/* CONTEÚDO COM BOTÃO VOLTAR NO MOBILE */}
      <div className={`tab-content ${showMenu ? 'hidden-mobile' : ''}`}>
        {!showMenu && (
          <div className="mobile-back-header">
            <button className="back-to-menu-btn" onClick={handleBackToMenu}>
              <ChevronLeft size={18} /> Voltar ao Painel
            </button>
            <h3 className="mobile-tab-title">{tabs[activeTab].label}</h3>
          </div>
        )}
        {tabs[activeTab].content}
      </div>
    </div>
  );
};