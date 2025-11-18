import React, { useState } from 'react';
import './styles.css';
import { useMyBookings, completeReturn, cancelBooking } from '../../services/frota.services';
import { FrotaHeader } from '../../components/Header';
import { VehicleCard } from '../../components/VehicleCard';
import { ReturnVehicleModal } from '../../components/ReturnVehicleModal';
import { FuelSupplyModal } from '../../components/FuelSupplyModal'; // ✅ NOVA IMPORT
import { createFuelSupply } from '../../services/fuelSupply.services';
import { BookingWithVehicle } from '../../types';

export default function MeusVeiculosPage() {
  const { bookings, isLoading, error, refetchBookings } = useMyBookings();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithVehicle | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ NOVOS ESTADOS PARA MODAL DE ABASTECIMENTO
  const [isFuelSupplyModalOpen, setIsFuelSupplyModalOpen] = useState(false);
  const [selectedVehicleForFuel, setSelectedVehicleForFuel] = useState<any>(null);
  const [isFuelSubmitting, setIsFuelSubmitting] = useState(false);

  const handleOpenReturnModal = (booking: BookingWithVehicle) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleCloseReturnModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  // ✅ NOVA FUNÇÃO: Abrir modal de abastecimento
  const handleOpenFuelSupplyModal = (vehicle: any) => {
    setSelectedVehicleForFuel(vehicle);
    setIsFuelSupplyModalOpen(true);
  };

  // ✅ NOVA FUNÇÃO: Fechar modal de abastecimento
  const handleCloseFuelSupplyModal = () => {
    setIsFuelSupplyModalOpen(false);
    setSelectedVehicleForFuel(null);
  };

  const handleConfirmReturn = async (bookingId: number, endMileage: number, parkingLocation: string) => {
    setIsSubmitting(true);
    try {
      await completeReturn(bookingId, { end_mileage: endMileage, parking_location: parkingLocation });
      alert('Veículo devolvido com sucesso!');
      handleCloseReturnModal();
      refetchBookings();
    } catch (err) {
      console.error('Erro ao devolver veículo:', err);
      alert('Erro ao devolver veículo. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
      const confirmCancel = window.confirm("Tem certeza que deseja cancelar esta reserva?");
      if (!confirmCancel) return;

      try {
          await cancelBooking(bookingId);
          alert("Reserva cancelada com sucesso!");
          refetchBookings();
      } catch (err) {
          console.error('Erro ao cancelar reserva:', err);
          alert('Erro ao cancelar reserva. Tente novamente.');
      }
  };

  const handleConfirmFuelSupply = async (fuelSupplyData: any) => {
  setIsFuelSubmitting(true);
  try {
    // ✅ PEGAR USER_ID DO TOKEN
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Usuário não autenticado');
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    const user_id = payload.sub; // O 'sub' do JWT contém o user_id
    
    const completeFuelSupplyData = {
      ...fuelSupplyData,
      user_id: parseInt(user_id) // ✅ AGORA COM USER_ID CORRETO
    };
    
    await createFuelSupply(completeFuelSupplyData);
    alert('Abastecimento lançado com sucesso!');
    handleCloseFuelSupplyModal();
    refetchBookings();
  } catch (err) {
    console.error('Erro ao lançar abastecimento:', err);
    alert('Erro ao lançar abastecimento. Tente novamente.');
  } finally {
    setIsFuelSubmitting(false);
  }
};

  const renderContent = () => {
    if (isLoading) {
      return <div className="page-status">A carregar os seus veículos...</div>;
    }
  
    if (error) {
      return <div className="page-status error">{error}</div>;
    }

    //@ts-ignore
    const approvedBookings = bookings?.filter(b => b.status === 'in-use' || b.status === 'confirmed') || [];

    if (approvedBookings.length === 0) {
        return <p className="empty-message">Você não tem veículos retirados ou agendamentos confirmados no momento.</p>;
    }

    return (
        <div className="vehicle-grid">
            {approvedBookings.map((booking) => (
                <VehicleCard 
                  key={booking.id} 
                  vehicle={booking.vehicle} 
                  booking={booking}
                  onDevolver={() => handleOpenReturnModal(booking)}
                  onCancelar={() => handleCancelBooking(booking.id)}
                  onAbastecimento={() => handleOpenFuelSupplyModal(booking.vehicle)} // ✅ NOVA PROP
                  isMyVehiclesPage={true}
                />
            ))}
        </div>
    );
  };

  return (
    <div className="frota-module">
      <FrotaHeader />
      <main className="frota-container page-layout">
        <section>
          <h2 className="section-title">Meus Veículos</h2>
          <p className="section-subtitle">Veículos que estão atualmente sob sua responsabilidade ou agendados</p>
          {renderContent()}
        </section>
        
        {/* Modal de Devolução */}
        <ReturnVehicleModal
          isOpen={isModalOpen}
          onClose={handleCloseReturnModal}
          onConfirmReturn={handleConfirmReturn}
          booking={selectedBooking}
          isSubmitting={isSubmitting}
        />

        {/* ✅ NOVO MODAL: Abastecimento */}
        <FuelSupplyModal
          isOpen={isFuelSupplyModalOpen}
          onClose={handleCloseFuelSupplyModal}
          onConfirm={handleConfirmFuelSupply}
          vehicle={selectedVehicleForFuel}
          isSubmitting={isFuelSubmitting}
        />
      </main>
    </div>
  );
}