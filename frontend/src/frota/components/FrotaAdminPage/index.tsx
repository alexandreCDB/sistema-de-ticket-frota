import React from 'react'; 
import { FrotaHeader } from '../Header'; 
import { Tabs } from '../Tabs';
import { PendingRequests } from './PendingRequests';
import { FleetStatus } from './FleetStatus'; // Importa o novo componente
import './styles.css'; 

export default function FrotaAdminPage() { 

  const adminTabs = [
    {
      label: 'Solicitações Pendentes',
      content: <PendingRequests />
    },
    {
      label: 'Status da Frota',
      content: <FleetStatus /> // <<< AQUI ESTÁ A MUDANÇA
    },
    {
      label: 'Histórico',
      content: <div className="empty-message">Em breve...</div>
    },
    {
      label: 'Gestão de Veículos',
      content: <div className="empty-message">Em breve...</div>
    }
  ];

  return ( 
    <div className="frota-module"> 
      <FrotaHeader /> 
      <main className="frota-container page-layout"> 
        <section> 
          <h2 className="section-title">Painel do Administrador</h2> 
          <p className="section-subtitle">Gerenciar e visualizar o status da frota de veículos.</p>
          <div className="admin-content-wrapper">
            <Tabs tabs={adminTabs} />
          </div>
        </section> 
      </main> 
    </div> 
  ); 
}