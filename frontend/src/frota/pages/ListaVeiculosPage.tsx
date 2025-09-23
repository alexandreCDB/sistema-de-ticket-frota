// src/frota/pages/ListaVeiculosPage.tsx

import React, { useState } from 'react'; // Adicionado useState
import '../styles/frota.css';
import './ListaVeiculosPage.css';
import { useAuth } from '../../tickets/services/App.services'; 
import { useVehicles } from '../services/frota.services';
import { Dashboard } from '../components/Dashboard';
import { VehicleCard } from '../components/VehicleCard';
import { CheckoutModal } from '../components/CheckoutModal'; // Importa o novo modal
import { Vehicle } from '../types'; // Importa o tipo Vehicle

export default function ListaVeiculosPage() {
  const { loadingUser } = useAuth();
  const { vehicles, isLoading, error } = useVehicles();
  
  // Estados para controlar o modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Funções para abrir e fechar o modal
  const handleOpenCheckoutModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVehicle(null);
  };

  if (loadingUser || isLoading) {
    return <div className="page-status">Carregando...</div>;
  }

  if (error) {
    return <div className="page-status error">Erro: {error}</div>;
  }

  return (
    <div className="frota-module"> 
      <main className="frota-container page-layout">
        <section>
          <h2 className="section-title">Dashboard de Veículos</h2>
          <Dashboard vehicles={vehicles || []} />
        </section>

        <section>
          <h2 className="section-title">Veículos da Frota</h2>
          <p className="section-subtitle">Visão geral de todos os veículos cadastrados</p>
          <div className="vehicle-grid">
            {vehicles && vehicles.length > 0 ? (
              vehicles.map((vehicle) => (
                <VehicleCard 
                  key={vehicle.id} 
                  vehicle={vehicle} 
                  // Passa a função para o card para que ele possa abrir o modal
                  onRetirar={handleOpenCheckoutModal} 
                />
              ))
            ) : (
              <p>Nenhum veículo cadastrado no sistema.</p>
            )}
          </div>
        </section>
      </main>

      {/* O Modal é renderizado aqui, mas só aparece quando isModalOpen for true */}
      <CheckoutModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        vehicle={selectedVehicle}
      />
    </div>
  );
}