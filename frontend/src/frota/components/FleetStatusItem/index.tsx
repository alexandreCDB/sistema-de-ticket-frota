import React from 'react';
import './styles.css';
import { BookingWithVehicle } from '../../types';
import { User, MapPin, Car } from 'lucide-react';
import { format } from 'date-fns';

interface FleetStatusItemProps {
  booking: BookingWithVehicle;
}

export const FleetStatusItem: React.FC<FleetStatusItemProps> = ({ booking }) => {
  
  const formatDate = (dateString: string) => format(new Date(dateString), 'dd/MM/yyyy');
  const formatTime = (dateString: string) => format(new Date(dateString), 'HH:mm');

  // Define a classe com base no status para a cor
  const itemClass = `fleet-status-card status-${booking.status}`;

  return (
    <div className={itemClass}>
      {/* Informações principais do veículo */}
      <div className="card-vehicle-info">
        <div className="card-icon-wrapper">
            <Car size={20} /> {/* Ícone menor */}
        </div>
        <div className="card-details">
          <h4>{booking.vehicle.name}</h4>
          <p>{booking.vehicle.license_plate}</p>
        </div>
      </div>

      {/* Informações do condutor e finalidade */}
      <div className="card-driver-purpose">
        <p><User size={14} /> <strong>Condutor:</strong> {booking.user?.name || `ID ${booking.user_id}`}</p>
        <p><MapPin size={14} /> <strong>Finalidade:</strong> {booking.purpose}</p>
      </div>

      {/* Status e horários */}
      <div className="card-status-time">
        <span className={`status-badge status-${booking.status}`}>
          {booking.status === 'in-use' ? 'Em Uso' : booking.status === 'confirmed' ? 'Reservado' : booking.status}
        </span>
        <p>Início: {formatDate(booking.start_time)} às {formatTime(booking.start_time)}</p>
        {booking.end_time && (
          <p>Fim: {formatDate(booking.end_time)} às {formatTime(booking.end_time)}</p>
        )}
      </div>
    </div>
  );
};