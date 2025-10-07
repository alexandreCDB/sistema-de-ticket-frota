import React from 'react';
import './styles.css';
import { BookingWithVehicle } from '../../types';
// 1. REMOVIDO: A importação da imagem padrão foi deletada
// import defaultVehicleImage from '../../../assets/images/kwid.png';
import { Clock, User, Calendar, Tag, GitBranch, Car } from 'lucide-react'; // Adicionado ícone 'Car'
import { format } from 'date-fns';

// @ts-ignore
const API_URL_BASE = import.meta.env.VITE_API_URL.replace('/api', '');

interface BookingCardProps {
  booking: BookingWithVehicle;
  onApprove?: (bookingId: number) => void;
  onDeny?: (bookingId: number) => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking, onApprove, onDeny }) => {
  
  // 2. ALTERADO: A lógica agora retorna a URL completa ou null se não houver imagem
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

  const typeLabel = booking.type === 'checkout' ? 'Retirada' : booking.type === 'schedule' ? 'Agendamento' : 'Não informado';

  const requesterName = booking.user?.email ? booking.user.email.split('@')[0] : `ID: ${booking.user_id}`;

  return (
    <div className="booking-card">
      <div className="booking-card-image">
        <h3 className="booking-vehicle-name">{booking.vehicle.name}</h3>
        
        {/* 3. ALTERADO: Renderização condicional da imagem */}
        {imageUrl ? (
          <img src={imageUrl} alt={booking.vehicle.name} />
        ) : (
          <div className="image-placeholder">
            <Car size={48} />
            <span>Sem imagem</span>
          </div>
        )}
      </div>
      <div className="booking-card-content">
        <div className="booking-card-header">
          <span className="booking-status-badge">{booking.status || 'Status não informado'}</span>
        </div>
        <div className="booking-card-details">
          <div className="detail-item"><GitBranch size={14} /> <strong>Placa:</strong> {booking.vehicle.license_plate || 'Não informada'}</div>
          <div className="detail-item"><User size={14} /> <strong>Solicitante:</strong> {requesterName}</div>
          <div className="detail-item"><Tag size={14} /> <strong>Tipo:</strong> {typeLabel}</div>
          <div className="detail-item"><Calendar size={14} /> <strong>Data:</strong> {formatDate(booking.start_time)}</div>
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