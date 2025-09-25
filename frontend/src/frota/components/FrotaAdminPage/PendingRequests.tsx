import React from 'react';
import { PendingRequestItem } from '../PendingRequestItem'; // Importa o novo item
import { useMyBookings, approveBooking, denyBooking } from '../../services/frota.services';

export const PendingRequests = () => {
  const { bookings, isLoading, error, refetchBookings } = useMyBookings();

  const handleApprove = async (bookingId: number) => {
    try {
      await approveBooking(bookingId);
      refetchBookings();
    } catch (err) {
      console.error("Erro ao aprovar:", err);
    }
  };

  const handleDeny = async (bookingId: number) => {
    try {
      await denyBooking(bookingId);
      refetchBookings();
    } catch (err) {
      console.error("Erro ao negar:", err);
    }
  };
  
  const pendingBookings = bookings?.filter(b => b.status === 'pending') || [];

  if (isLoading) return <div className="page-status">A carregar solicitações...</div>;
  if (error) return <div className="page-status error">{error}</div>;

  return (
    <>
      {pendingBookings.length === 0 ? (
        <p className="empty-message">Nenhuma solicitação pendente no momento.</p>
      ) : (
        <div className="admin-list">
          {pendingBookings.map(booking => (
            <PendingRequestItem  
              key={booking.id}  
              booking={booking}
              onApprove={handleApprove} 
              onDeny={handleDeny} 
            />
          ))}
        </div>
      )}
    </>
  );
};