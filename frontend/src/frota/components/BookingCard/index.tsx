import React from 'react';
import { Booking, Vehicle } from '../../types';
import { Car, Users, Calendar, Tag } from 'lucide-react';
import defaultVehicleImage from '../../../assets/onix.png';
import './styles.css';

interface BookingCardProps {
  booking: Booking;
  vehicle: Vehicle;
  onApprove: (bookingId: number) => void;
  onDeny: (bookingId: number) => void;
}

export function BookingCard({ booking, vehicle, onApprove, onDeny }: BookingCardProps) {
  const imageUrl = vehicle.image_url || defaultVehicleImage;

  return (
    <div className="booking-card">
      <div className="card-image-wrapper">
        <img src={imageUrl} alt={vehicle.name} className="card-main-image" />
      </div>

      <div className="card-content">
        <div className="card-header">
          <h3 className="card-title">{vehicle.name}</h3>
          <span className="booking-badge pending">Pendente</span>
        </div>
        
        <div className="booking-details-grid">
          <div className="detail-item">
            <Car size={16} />
            <span className="detail-label">Placa:</span>
            <span className="detail-value">{vehicle.license_plate}</span>
          </div>
          <div className="detail-item">
            <Users size={16} />
            <span className="detail-label">Solicitante:</span>
            <span className="detail-value">{booking.user_id}</span>
          </div>
          <div className="detail-item">
            <Tag size={16} />
            <span className="detail-label">Tipo:</span>
            <span className="detail-value">{booking.type === 'checkout' ? 'Retirada' : 'Agendamento'}</span>
          </div>
          {booking.start_time && (
            <div className="detail-item">
              <Calendar size={16} />
              <span className="detail-label">Data:</span>
              <span className="detail-value">{new Date(booking.start_time).toLocaleDateString()}</span>
            </div>
          )}
          {booking.purpose && (
            <div className="detail-item full-width">
              <span className="detail-label">Motivo:</span>
              <span className="detail-value">{booking.purpose}</span>
            </div>
          )}
        </div>
        
        <div className="card-actions">
          <button className="btn btn-success" onClick={() => onApprove(booking.id)}>
            Aprovar
          </button>
          <button className="btn btn-danger" onClick={() => onDeny(booking.id)}>
            Negar
          </button>
        </div>
      </div>
    </div>
  );
}