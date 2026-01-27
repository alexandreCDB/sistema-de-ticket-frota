import React from 'react';
import { FrotaHeader } from '../Header';
import { Tabs } from '../Tabs';
import { PendingRequests } from './PendingRequests';
import { FleetStatus } from './FleetStatus';
import { History } from './History';
// --- MUDANÇA 1: Importar o novo componente de Gestão de Veículos ---
import { VehicleManagement } from './VehicleManagement';
// ✅ NOVO: Importar o componente de Histórico de Abastecimento
import { FuelSupplyHistory } from '../FuelSupplyHistory';
import { Mail, CheckCircle, Calendar, Fuel, Settings } from 'lucide-react'; // ✅ Importar ícones
import './styles.css';

export default function FrotaAdminPage() {

  const adminTabs = [
    {
      label: 'Solicitações Pendentes',
      content: <PendingRequests />,
      icon: <Mail size={20} /> // ✅ Adicionar ícone
    },
    {
      label: 'Status da Frota',
      content: <FleetStatus />,
      icon: <CheckCircle size={20} /> // ✅ Adicionar ícone
    },
    {
      label: 'Histórico de Reservas',
      content: <History />,
      icon: <Calendar size={20} /> // ✅ Adicionar ícone
    },
    {
      label: 'Histórico de Abastecimento',
      content: <FuelSupplyHistory />,
      icon: <Fuel size={20} /> // ✅ Adicionar ícone
    },
    {
      label: 'Gestão de Veículos',
      content: <VehicleManagement />,
      icon: <Settings size={20} /> // ✅ Adicionar ícone
    }
  ];

  return (
    <div className="frota-module">
      <FrotaHeader />
      <main className="frota-container page-layout">
        <section>
          <h2 className="section-title">Painel do Administrador</h2>
          <div className="admin-content-wrapper">
            <Tabs tabs={adminTabs} />
          </div>
        </section>
      </main>
    </div>
  );
}