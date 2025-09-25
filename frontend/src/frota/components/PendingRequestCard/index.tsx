import React from 'react';
import './styles.css';
import { BookingWithVehicle } from '../../types';
import { User, Clock, Calendar, Info } from 'lucide-react';
import { format } from 'date-fns';

interface PendingRequestCardProps {
  booking: BookingWithVehicle;
  onApprove: (bookingId: number) => void;
  onDeny: (bookingId: number) => void;
}

export const PendingRequestCard: React.FC<PendingRequestCardProps> = ({ booking, onApprove, onDeny }) => {
  
  const isSchedule = booking.type === 'schedule';
  const cardClass = isSchedule ? 'request-card schedule' : 'request-card checkout';

  const formatDate = (dateString: string) => format(new Date(dateString), 'dd/MM/yyyy');
  const formatTime = (dateString: string) => format(new Date(dateString), 'HH:mm');

  return (
    <div className={cardClass}>
      <div className="request-info">
        <div className="request-vehicle">
          <span className="request-vehicle-icon">{isSchedule ? '📅' : '🚗'}</span>
          <div>
            <h4>{booking.vehicle.name}</h4>
            <p>{booking.vehicle.license_plate}</p>
          </div>
        </div>
        <div className="request-details">
          <p><User size={14} /> <strong>Solicitante:</strong> {booking.user?.name || `ID: ${booking.user_id}`}</p>
          <p><Info size={14} /> <strong>Finalidade:</strong> {booking.purpose}</p>
          <p><Clock size={14} /> <strong>Horário:</strong> {formatTime(booking.start_time)}</p>
          <p><Calendar size={14} /> <strong>Data:</strong> {formatDate(booking.start_time)}</p>
        </div>
      </div>
      <div className="request-actions">
        <button className="btn-approve" onClick={() => onApprove(booking.id)}>Aprovar</button>
        <button className="btn-deny" onClick={() => onDeny(booking.id)}>Recusar</button>
      </div>
    </div>
  );
};