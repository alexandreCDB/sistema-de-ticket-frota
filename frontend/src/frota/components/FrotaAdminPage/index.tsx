import React from 'react'; 
import { FrotaHeader } from '../Header'; 
import { Tabs } from '../Tabs';
import { PendingRequests } from './PendingRequests';
import { FleetStatus } from './FleetStatus';
import { History } from './History';
// --- MUDANÇA 1: Importar o novo componente de Gestão de Veículos ---
import { VehicleManagement } from './VehicleManagement';
import './styles.css'; 

export default function FrotaAdminPage() { 

  const adminTabs = [
    {
      label: 'Solicitações Pendentes',
      content: <PendingRequests />
    },
    {
      label: 'Status da Frota',
      content: <FleetStatus />
    },
    {
      label: 'Histórico',
      content: <History />
    },
    {
      label: 'Gestão de Veículos',
      // --- MUDANÇA 2: Substituir o "Em breve..." pelo componente funcional ---
      content: <VehicleManagement />
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