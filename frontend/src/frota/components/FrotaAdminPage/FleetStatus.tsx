import React from 'react';
import { BookingCard } from '../BookingCard';
import { useMyBookings } from '../../services/frota.services';

export const FleetStatus = () => {
  const { bookings, isLoading, error } = useMyBookings();

  // Filtra para mostrar apenas veículos que estão fora da garagem
  const activeBookings = bookings?.filter(b => b.status === 'in-use' || b.status === 'confirmed') || [];

  if (isLoading) return <div className="page-status">A carregar status da frota...</div>;
  if (error) return <div className="page-status error">{error}</div>;

  return (
    
    <>
      {activeBookings.length === 0 ? (
        <p className="empty-message">Nenhum veículo em uso ou reservado no momento.</p>
      ) : (
        <div className="admin-grid">
          {activeBookings.map(booking => (
            <BookingCard  
              key={booking.id}  
              booking={booking}
              showScheduleDates={true} // ✅ AGORA MOSTRA AS DATAS DO AGENDAMENTO
            />
          ))}
        </div>
      )}

      
    </>
  );
};