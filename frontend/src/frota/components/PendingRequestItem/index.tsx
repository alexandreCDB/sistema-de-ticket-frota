import React from 'react';
import './styles.css'; // Certifique-se que este caminho está correto para o CSS
import { BookingWithVehicle } from '../../types';
import { User, Clock, Calendar, Info, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../../components/AUTH/AuthContext';

interface PendingRequestItemProps {
  booking: BookingWithVehicle;
  onApprove: (bookingId: number) => void;
  onDeny: (bookingId: number) => void;
}

export const PendingRequestItem: React.FC<PendingRequestItemProps> = ({ booking, onApprove, onDeny }) => {
  const { user: currentUser } = useAuth();

  const isSchedule = booking.type === 'schedule';
  const cardClass = isSchedule ? 'request-item schedule' : 'request-item checkout';

  const formatDate = (dateString: string) => format(new Date(dateString), 'dd/MM/yyyy');
  const formatTime = (dateString: string) => format(new Date(dateString), 'HH:mm');

  // REGRA: Um admin não pode aprovar a própria reserva
  const isOwnRequest = currentUser && booking.user_id === currentUser.id;

  return (
    <div className={cardClass}>
      <div className="card-content">
        <div className="vehicle-info">
          <div className="icon-wrapper">
            🚗
          </div>
          <div className="vehicle-details">
            <h4>{booking.vehicle.name} {booking.vehicle.year}</h4>
            <p>{booking.vehicle.license_plate}</p>
          </div>
        </div>

        <div className="request-details-grid">
          {/* Alterado para mostrar email do usuário */}
          <p>
            <User size={14} /> Solicitan­te:{" "} {booking.user?.email ? booking.user.email.split("@")[0] : `ID ${booking.user_id}`}
            {isOwnRequest && <span className="own-request-badge"> (Você)</span>}
          </p>

          <p><Clock size={14} /> Horário: {formatTime(booking.start_time)}</p>
          <p><Info size={14} /> Finalidade: {booking.purpose}</p>
          <p><Calendar size={14} /> Data: {formatDate(booking.start_time)}</p>
        </div>
      </div>

      <div className="item-actions">
        {isOwnRequest ? (
          <div className="self-request-message">
            <ShieldAlert size={16} />
            <span>Aguardando outro admin</span>
          </div>
        ) : (
          <>
            <button className="btn-approve" onClick={() => onApprove(booking.id)}>
              <CheckCircle2 size={16} /> Aprovar
            </button>
            <button className="btn-deny" onClick={() => onDeny(booking.id)}>
              <XCircle size={16} /> Recusar
            </button>
          </>
        )}
      </div>
    </div>
  );
};
