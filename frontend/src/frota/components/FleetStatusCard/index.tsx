import React from 'react';
import './styles.css';
import { BookingWithVehicle } from '../../types';
import { Car, User, MapPin } from 'lucide-react';

interface FleetStatusCardProps {
  booking: BookingWithVehicle;
}

export const FleetStatusCard: React.FC<FleetStatusCardProps> = ({ booking }) => {
  const { vehicle, user } = booking;

  const statusMap = {
    'in-use': { text: 'Em Uso', className: 'status-in-use' },
    'confirmed': { text: 'Reservado', className: 'status-reserved' },
    'available': { text: 'Disponível', className: 'status-available' },
    'maintenance': { text: 'Manutenção', className: 'status-maintenance' },
  };

  const currentStatus = statusMap[booking.status] || { text: booking.status, className: 'status-default' };

  return (
    <div className="status-card-wrapper">
      <div className="status-card-header">
        <div className="status-card-icon">
          <Car size={20} />
        </div>
        <div className={`status-card-badge ${currentStatus.className}`}>
          {currentStatus.text}
        </div>
      </div>
      <div className="status-card-body">
        <h4>{vehicle.name}</h4>
        <p className="vehicle-plate">{vehicle.license_plate}</p>
        
        <div className="driver-info">
          <div className="info-line">
            <User size={14} />
            <span>Condutor: {user?.name || `ID: ${booking.user_id}`}</span>
          </div>
          <div className="info-line">
            <MapPin size={14} />
            <span>Finalidade: {booking.purpose || 'Não informada'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};