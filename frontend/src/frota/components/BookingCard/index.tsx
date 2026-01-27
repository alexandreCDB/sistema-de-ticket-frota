import React from 'react';
import './styles.css';
import { BookingWithVehicle } from '../../types';
import { Clock, User, Calendar, Tag, GitBranch, Car, CalendarDays, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../../components/AUTH/AuthContext';

// @ts-ignore
const API_URL_BASE = import.meta.env.VITE_API_URL.replace('/api', '');

interface BookingCardProps {
  booking: BookingWithVehicle;
  onApprove?: (bookingId: number) => void;
  onDeny?: (bookingId: number) => void;
  showScheduleDates?: boolean;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onApprove,
  onDeny,
  showScheduleDates = false
}) => {
  const { user: currentUser } = useAuth();

  const imageUrl = booking.vehicle.image_url
    ? `${API_URL_BASE}${booking.vehicle.image_url}`
    : null;

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Data não informada';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch {
      return 'Data inválida';
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'Data não informada';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    } catch {
      return 'Data inválida';
    }
  };

  const typeLabel = booking.type === 'checkout' ? 'Retirada' : booking.type === 'schedule' ? 'Agendamento' : 'Não informado';

  const requesterName = booking.user?.email ? booking.user.email.split('@')[0] : `ID: ${booking.user_id}`;

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'pending': 'Pendente',
      'confirmed': 'Confirmado',
      'in-use': 'Em Uso',
      'denied': 'Negado',
      'returned': 'Devolvido'
    };
    return labels[status.toLowerCase()] || status;
  };

  const displayStatus = booking.status?.toLowerCase().replace(' ', '-') || 'unknown';

  // REGRA: Um admin não pode aprovar a própria reserva
  const isOwnRequest = currentUser && booking.user_id === currentUser.id;

  return (
    <div className={`booking-card compact pulse-border card-status-${displayStatus}`}>
      {/* ✅ FOTO DO CARRO ADICIONADA */}
      <div className="booking-card-image-compact">
        {imageUrl ? (
          <img src={imageUrl} alt={booking.vehicle.name} className="vehicle-image-compact" />
        ) : (
          <div className="image-placeholder-compact">
            <Car size={24} />
          </div>
        )}
      </div>

      <div className="booking-card-content">
        <div className="booking-card-header">
          <h3 className="booking-vehicle-name">{booking.vehicle.name}</h3>
          <span className={`booking-status-badge status-${displayStatus}`}>
            {getStatusLabel(booking.status || 'unknown')}
          </span>
        </div>

        <div className="booking-card-details">
          <div className="detail-row">
            <GitBranch size={12} />
            <span className="detail-text">{booking.vehicle.license_plate || 'Placa não informada'}</span>
          </div>

          <div className="detail-row">
            <User size={12} />
            <span className="detail-text">
              {requesterName}
              {isOwnRequest && <span style={{ fontSize: '0.7rem', color: '#92400e', background: '#fef3c7', padding: '1px 5px', borderRadius: '10px', marginLeft: '5px' }}> (Você)</span>}
            </span>
          </div>

          <div className="detail-row">
            <Tag size={12} />
            <span className="detail-text">{typeLabel}</span>
          </div>

          <div className="detail-row">
            <Calendar size={12} />
            <span className="detail-text">{formatDate(booking.start_time)}</span>
          </div>

          {/* ✅ SEÇÃO DE DATAS DO AGENDAMENTO - COMPACTA */}
          {showScheduleDates && booking.type === 'schedule' && (
            <div className="schedule-dates-compact">
              <div className="schedule-date-compact">
                <CalendarDays size={12} />
                <span className="schedule-label">Início:</span>
                <span className="schedule-value">{formatDateTime(booking.start_time)}</span>
              </div>
              <div className="schedule-date-compact">
                <CalendarDays size={12} />
                <span className="schedule-label">Fim:</span>
                <span className="schedule-value">{formatDateTime(booking.end_time || booking.start_time)}</span>
              </div>
            </div>
          )}

          {/* ✅ PARA RETIRADAS - COMPACTA */}
          {showScheduleDates && booking.type === 'checkout' && (
            <div className="schedule-dates-compact">
              <div className="schedule-date-compact">
                <Clock size={12} />
                <span className="schedule-label">Retirada:</span>
                <span className="schedule-value">{formatDateTime(booking.start_time)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="booking-card-purpose">
          <p><strong>Motivo:</strong> {booking.purpose || 'Não informado'}</p>
        </div>

        {(onApprove && onDeny) && (
          <div className="booking-card-actions">
            {isOwnRequest ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#c2410c', background: '#fff7ed', padding: '5px 10px', borderRadius: '5px', fontSize: '0.8rem', border: '1px dashed #fdba74' }}>
                <ShieldAlert size={14} />
                <span>Aguardando outro admin</span>
              </div>
            ) : (
              <>
                <button className="btn btn-success" onClick={() => onApprove(booking.id)}>Aprovar</button>
                <button className="btn btn-danger" onClick={() => onDeny(booking.id)}>Negar</button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
