import React, { useState } from 'react';
//@ts-ignore
import '../styles/frota.css';
//@ts-ignore
import './ListaVeiculosPage.css';
import { useAuth } from '../../tickets/services/App.services'; 
import { useVehiclesWithBookings } from '../services/frota.services'; 
import { Dashboard } from '../components/Dashboard';
import { VehicleCard } from '../components/VehicleCard';
import { CheckoutModal } from '../components/CheckoutModal';
import { ScheduleModal } from '../components/ScheduleModal';
import { SuccessToast } from '../components/SucessToast';
import { VehicleWithBookings } from '../types';
import { FrotaHeader } from '../components/Header';
import Loading from '../../components/Loads/Loading';
import { useAuth } from '../../components/AUTH/AuthContext';

export default function ListaVeiculosPage() {
  const { user, loadingUser } = useAuth(); // Usando o 'user' para encontrar a reserva ativa do usuário
  const { vehicles, isLoading, error, refetchVehicles } = useVehiclesWithBookings();
  
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithBookings | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
    setToastMessage("Solicitação enviada com sucesso para aprovação!");
  };
  
  if (loadingUser || isLoading) {
    return (
      <div className="frota-module">
        <FrotaHeader />
        <div className="page-status"><Loading /></div>
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

      {/* ... (suas modais e toasts continuam iguais) ... */}
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
      {toastMessage && (
        <SuccessToast 
          message={toastMessage} 
          onClose={() => setToastMessage(null)} 
        />
      )}
    </div>
  );
}