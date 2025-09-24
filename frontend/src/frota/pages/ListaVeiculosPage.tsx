import React, { useState } from 'react';
import '../styles/frota.css';
import './ListaVeiculosPage.css';
import { useAuth } from '../../tickets/services/App.services'; 
// A importação abaixo agora funcionará, desde que a função esteja no arquivo
import { useVehiclesWithBookings } from '../services/frota.services'; 
import { Dashboard } from '../components/Dashboard';
import { VehicleCard } from '../components/VehicleCard';
import { CheckoutModal } from '../components/CheckoutModal';
import { ScheduleModal } from '../components/ScheduleModal';
import { VehicleWithBookings } from '../types';
import { FrotaHeader } from '../components/Header';

export default function ListaVeiculosPage() {
  const { loadingUser } = useAuth();
  const { vehicles, isLoading, error, refetchVehicles } = useVehiclesWithBookings();
  
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithBookings | null>(null);

  const handleOpenCheckoutModal = (vehicle: VehicleWithBookings) => {
    setSelectedVehicle(vehicle);
    setIsCheckoutModalOpen(true);
  };
  
  const handleOpenScheduleModal = (vehicle: VehicleWithBookings) => {
    setSelectedVehicle(vehicle);
    setIsScheduleModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsCheckoutModalOpen(false);
    setIsScheduleModalOpen(false);
    setSelectedVehicle(null);
  };

  const handleSuccess = () => {
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
          {/* O Dashboard agora pode lidar com o novo tipo de dado */}
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
                  onRetirar={() => handleOpenCheckoutModal(vehicle)}
                  onAgendar={() => handleOpenScheduleModal(vehicle)}
                  bookings={vehicle.bookings}
                />
              ))
            ) : (
              <p>Nenhum veículo cadastrado no sistema.</p>
            )}
          </div>
        </section>
      </main>

      <CheckoutModal 
        isOpen={isCheckoutModalOpen}
        onClose={handleCloseModal}
        vehicle={selectedVehicle}
        onConfirm={handleSuccess}
      />
      
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={handleCloseModal}
        vehicle={selectedVehicle}
        onConfirm={handleSuccess}
      />
    </div>
  );
}