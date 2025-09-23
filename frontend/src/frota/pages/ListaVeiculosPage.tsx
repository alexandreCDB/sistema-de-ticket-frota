import React, { useState } from 'react';
import '../styles/frota.css';
import './ListaVeiculosPage.css';
import { useAuth } from '../../tickets/services/App.services'; 
import { useVehicles } from '../services/frota.services';
import { Dashboard } from '../components/Dashboard';
import { VehicleCard } from '../components/VehicleCard';
import { CheckoutModal } from '../components/CheckoutModal';
import { Vehicle } from '../types';
import { FrotaHeader } from '../components/Header';

export default function ListaVeiculosPage() {
  const { loadingUser } = useAuth();
  const { vehicles, isLoading, error, refetchVehicles } = useVehicles();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const handleOpenCheckoutModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVehicle(null);
  };

  const handleCheckoutSuccess = () => {
    handleCloseModal();
    refetchVehicles();
  };

  if (loadingUser || isLoading) {
    return (
      <div className="frota-module">
        <FrotaHeader />
        <div className="page-status">A carregar...</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="frota-module">
        <FrotaHeader />
        <div className="page-status error">Erro: {error}</div>
      </div>
    );
  }

  return (
    <div className="frota-module"> 
      <FrotaHeader />
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
                  onRetirar={handleOpenCheckoutModal} 
                />
              ))
            ) : (
              <p>Nenhum veículo cadastrado no sistema.</p>
            )}
          </div>
        </section>
      </main>

      <CheckoutModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        vehicle={selectedVehicle}
        onConfirm={handleCheckoutSuccess}
      />
    </div>
  );
}