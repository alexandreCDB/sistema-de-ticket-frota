import React from 'react';
// --- CORREÇÃO: Importa o novo componente 'FleetStatusItem' ---
import { FleetStatusItem } from '../FleetStatusItem'; 
import { useMyBookings } from '../../services/frota.services';

export const FleetStatus = () => {
  const { bookings, isLoading, error } = useMyBookings();

  if (isLoading) return <div className="page-status">A carregar status da frota...</div>;
  if (error) return <div className="page-status error">{error}</div>;
  
  // Filtra para mostrar apenas veículos que estão fora da garagem (em uso ou confirmados)
  const activeBookings = bookings?.filter(b => b.status === 'in-use' || b.status === 'confirmed') || [];

  return (
    <>
      {activeBookings.length === 0 ? (
        <p className="empty-message">Nenhum veículo em uso ou reservado no momento.</p>
      ) : (
        // Usamos a classe de container de lista vertical
        <div className="admin-list-container"> 
          {activeBookings.map(booking => (
            // --- CORREÇÃO: Usa o novo componente 'FleetStatusItem' ---
            <FleetStatusItem  
              key={booking.id}  
              booking={booking}
            />
          ))}
        </div>
      )}
    </>
  );
};