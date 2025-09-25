import React, { useState } from 'react';
import './styles.css';
import { useMyBookings, completeReturn, cancelBooking } from '../../services/frota.services';
import { FrotaHeader } from '../../components/Header';
import { VehicleCard } from '../../components/VehicleCard';
import { ReturnVehicleModal } from '../../components/ReturnVehicleModal';
import { BookingWithVehicle } from '../../types';

export default function MeusVeiculosPage() {
  const { bookings, isLoading, error, refetchBookings } = useMyBookings();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithVehicle | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenReturnModal = (booking: BookingWithVehicle) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleCloseReturnModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
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

  const renderContent = () => {
    if (isLoading) {
      return <div className="page-status">A carregar os seus veículos...</div>;
    }
  
    if (error) {
      return <div className="page-status error">{error}</div>;
    }

    // --- CORREÇÃO NA LÓGICA DE FILTRAGEM ---
    // A linha abaixo foi alterada para mostrar apenas os status 'in-use' (em uso) e 'confirmed' (confirmado/aprovado).
    // Isto irá excluir as reservas com status 'pending' (pendente).
    const activeBookings = bookings?.filter(b => b.status === 'in-use' || b.status === 'confirmed') || [];

    if (activeBookings.length === 0) {
        return <p className="empty-message">Você não tem veículos retirados ou agendamentos confirmados no momento.</p>;
    }

    return (
        <div className="vehicle-grid">
            {activeBookings.map((booking) => (
                <VehicleCard 
                  key={booking.id} 
                  vehicle={booking.vehicle} 
                  bookingStatus={booking.status}
                  // Ação de devolução só aparece se a reserva estiver 'in-use'
                  onDevolver={booking.status === 'in-use' ? () => handleOpenReturnModal(booking) : undefined}
                  // Ação de cancelar só aparece se a reserva estiver 'confirmed' (mas ainda não em uso)
                  onCancelar={booking.status === 'confirmed' ? () => handleCancelBooking(booking.id) : undefined}
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
        <ReturnVehicleModal
          isOpen={isModalOpen}
          onClose={handleCloseReturnModal}
          onConfirmReturn={handleConfirmReturn}
          booking={selectedBooking}
          isSubmitting={isSubmitting}
        />
      </main>
    </div>
  );
}