import React from 'react';
import './styles.css';
import { BookingWithVehicle } from '../../types';
import { Car, User, CheckCircle, XCircle, Calendar, Clock } from 'lucide-react';
// Adicionado 'isSameDay' para comparar se as datas são no mesmo dia
import { format, isSameDay } from 'date-fns';

interface HistoryItemProps {
  booking: BookingWithVehicle;
}

export const HistoryItem: React.FC<HistoryItemProps> = ({ booking }) => {
  // A função formatDate não muda
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
        {/* --- CORREÇÃO APLICADA AQUI --- */}
        <p>
          <Calendar size={14} /> 
          {
            // Se existir uma data de fim E ela for em um dia diferente da data de início...
            booking.end_time && !isSameDay(new Date(booking.start_time), new Date(booking.end_time))
              // ...mostra o intervalo "dd/mm/yyyy - dd/mm/yyyy"
              ? `${formatDate(booking.start_time)} - ${formatDate(booking.end_time)}`
              // ...senão, mostra apenas a data de início.
              : formatDate(booking.start_time)
          }
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