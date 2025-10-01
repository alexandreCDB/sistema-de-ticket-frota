import React from 'react';
import './styles.css';
import { BookingWithVehicle } from '../../types';
import { Car, User, CheckCircle, XCircle, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface HistoryItemProps {
  booking: BookingWithVehicle;
}

export const HistoryItem: React.FC<HistoryItemProps> = ({ booking }) => {
  const formatDate = (dateString: string) => format(new Date(dateString), 'dd/MM/yyyy');
  const formatTime = (dateString: string) => format(new Date(dateString), 'HH:mm');

  const isCompleted = booking.status === 'completed';
  const itemClass = isCompleted ? 'history-item completed' : 'history-item denied';
  const Icon = isCompleted ? CheckCircle : XCircle;

  return (
    <div className={itemClass}>
      <div className="history-icon-wrapper">
        <Car size={20} />
      </div>

      <div className="history-details">
        <h4>{booking.vehicle.name} <span>({booking.vehicle.license_plate})</span></h4>
       <p>
        <strong>Utilizador:</strong> {booking.user?.email ? booking.user.email.split('@')[0] : `ID ${booking.user_id}`} • <strong>Finalidade:</strong> {booking.purpose}
      </p>


      </div>

      <div className="history-time">
        <p>
          <Calendar size={14} /> 
          {formatDate(booking.start_time)}
        </p>
        <p>
          <Clock size={14} /> 
          {formatTime(booking.start_time)} - {booking.end_time ? formatTime(booking.end_time) : 'N/A'}
        </p>
      </div>
      
      <div className="history-status">
        <Icon size={20} />
        <span>{isCompleted ? 'Concluída' : 'Negada'}</span>
      </div>
    </div>
  );
};