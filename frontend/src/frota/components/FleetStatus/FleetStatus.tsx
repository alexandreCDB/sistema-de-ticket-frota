import React from 'react';
import { FleetStatusCard } from '../FleetStatusCard'; // Importa o novo cartão
import { useMyBookings } from '../../services/frota.services';

export const FleetStatus = () => {
  const { bookings, isLoading, error } = useMyBookings();

  if (isLoading) return <div className="page-status">A carregar status da frota...</div>;
  if (error) return <div className="page-status error">{error}</div>;
  
  // Filtra para mostrar apenas veículos que estão fora da garagem
  const activeBookings = bookings?.filter(b => b.status === 'in--use' || b.status === 'confirmed') || [];

  return (
    <>
      {activeBookings.length === 0 ? (
        <p className="empty-message">Nenhum veículo em uso ou reservado no momento.</p>
      ) : (
        <div className="fleet-status-grid">
          {activeBookings.map(booking => (
            <FleetStatusCard  
              key={booking.id}  
              booking={booking}
            />
          ))}
        </div>
      )}
    </>
  );
};