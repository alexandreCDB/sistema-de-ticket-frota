import React from 'react';
import './styles.css';
import { BookingWithVehicle } from '../../types';
import { Clock, User, Calendar, Tag, GitBranch, Car, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';

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

  return (
    <div className="booking-card compact">
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
          <span className={`booking-status-badge status-${booking.status?.toLowerCase().replace(' ', '-') || 'unknown'}`}>
            {booking.status || 'Status não informado'}
          </span>
        </div>
        
        <div className="booking-card-details">
          <div className="detail-row">
            <GitBranch size={12} />
            <span className="detail-text">{booking.vehicle.license_plate || 'Placa não informada'}</span>
          </div>
          
          <div className="detail-row">
            <User size={12} />
            <span className="detail-text">{requesterName}</span>
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
            <button className="btn btn-success" onClick={() => onApprove(booking.id)}>Aprovar</button>
            <button className="btn btn-danger" onClick={() => onDeny(booking.id)}>Negar</button>
          </div>
        )}
      </div>
    </div>
  );
};