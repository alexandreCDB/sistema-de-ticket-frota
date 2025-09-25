import React, { useState } from 'react';
import './styles.css';

interface Tab {
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
}

export const Tabs: React.FC<TabsProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="tabs-container">
      <nav className="tabs-nav">
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            className={`tab-button ${index === activeTab ? 'active' : ''}`}
            onClick={() => setActiveTab(index)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <div className="tab-content">
        {tabs[activeTab].content}
      </div>
    </div>
  );
};