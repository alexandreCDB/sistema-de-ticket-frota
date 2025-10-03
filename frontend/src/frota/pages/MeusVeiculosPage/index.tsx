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

    // O filtro correto: mostra apenas reservas APROVADAS ('confirmed') ou JÁ EM USO ('in-use')
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
                  booking={booking} // Passa o objeto de reserva completo para o card
                  onDevolver={() => handleOpenReturnModal(booking)}
                  onCancelar={() => handleCancelBooking(booking.id)}
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