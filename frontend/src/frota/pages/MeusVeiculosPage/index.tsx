import React, { useState } from 'react';
import './styles.css';
import { useMyBookings, completeReturn } from '../../services/frota.services';
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

  const renderContent = () => {
    if (isLoading) {
      return <div className="page-status">A carregar os seus veículos...</div>;
    }
  
    if (error) {
      return <div className="page-status error">{error}</div>;
    }

    // CORREÇÃO: Filtra por status 'in-use' ou 'confirmed' para exibir o veículo
    const activeBookings = bookings?.filter(b => b.status === 'in-use' || b.status === 'confirmed') || [];

    if (activeBookings.length === 0) {
        return <p className="empty-message">Você não tem veículos retirados no momento.</p>;
    }

    return (
      <div className="vehicle-grid">
          {activeBookings.map((booking) => (
              <VehicleCard 
                key={booking.id} 
                vehicle={booking.vehicle} 
                onDevolver={() => handleOpenReturnModal(booking)} 
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
          <p className="section-subtitle">Veículos que estão atualmente sob sua responsabilidade</p>
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