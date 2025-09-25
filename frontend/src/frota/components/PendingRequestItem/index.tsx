import React from 'react';
import './styles.css'; // Certifique-se que este caminho está correto para o CSS
import { BookingWithVehicle } from '../../types';
import { User, Clock, Calendar, Info, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface PendingRequestItemProps {
  booking: BookingWithVehicle;
  onApprove: (bookingId: number) => void;
  onDeny: (bookingId: number) => void;
}

export const PendingRequestItem: React.FC<PendingRequestItemProps> = ({ booking, onApprove, onDeny }) => {

  const isSchedule = booking.type === 'schedule';
  // Adiciona classes para a cor da borda e do fundo
  // Use 'schedule' para vermelho e 'checkout' para verde como no seu exemplo desejado
  const cardClass = isSchedule ? 'request-item schedule' : 'request-item checkout'; 

  const formatDate = (dateString: string) => format(new Date(dateString), 'dd/MM/yyyy');
  const formatTime = (dateString: string) => format(new Date(dateString), 'HH:mm');

  return (
    <div className={cardClass}>
      <div className="card-content">
        <div className="vehicle-info">
          <div className="icon-wrapper">
            🚗
          </div>
          <div className="vehicle-details">
            {/* Certifique-se que booking.vehicle.year existe ou remova */}
            <h4>{booking.vehicle.name} {booking.vehicle.year}</h4> 
            <p>{booking.vehicle.license_plate}</p>
          </div>
        </div>

        <div className="request-details-grid">
          <p><User size={14} /> Solicitante: {booking.user?.name || `ID ${booking.user_id}`}</p>
          <p><Clock size={14} /> Horário: {formatTime(booking.start_time)}</p>
          {/* Mudei a ordem para bater com a imagem que você enviou: Finalidade antes da Data */}
          <p><Info size={14} /> Finalidade: {booking.purpose}</p> 
          <p><Calendar size={14} /> Data: {formatDate(booking.start_time)}</p>
        </div>
      </div>

      <div className="item-actions">
        <button className="btn-approve" onClick={() => onApprove(booking.id)}>
          <CheckCircle2 size={16} /> Aprovar
        </button>
        <button className="btn-deny" onClick={() => onDeny(booking.id)}>
          <XCircle size={16} /> Recusar
        </button>
      </div>
    </div>
  );
};