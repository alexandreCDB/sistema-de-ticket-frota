import React from 'react';
import './styles.css';
import { BookingWithVehicle } from '../../types';
import defaultVehicleImage from '../../../assets/onix.png';
import { Clock, User, Calendar, Tag, GitBranch } from 'lucide-react';
import { format } from 'date-fns';

// --- PASSO 1: Importar a variável de ambiente com o endereço do seu servidor ---
// @ts-ignore
const API_URL_BASE = import.meta.env.VITE_API_URL.replace('/api', ''); // Ex: http://localhost:8000

interface BookingCardProps {
  booking: BookingWithVehicle;
  onApprove?: (bookingId: number) => void;
  onDeny?: (bookingId: number) => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking, onApprove, onDeny }) => {
  
  // --- PASSO 2: Lógica para decidir qual imagem usar ---
  const imageUrl = booking.vehicle.image_url
    ? `${API_URL_BASE}${booking.vehicle.image_url}` // Se houver URL no banco, constrói o endereço completo
    : defaultVehicleImage; // Senão, usa a imagem padrão

  // Função para formatar a data
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch {
      return 'Data inválida';
    }
  };

  return (
    <div className="booking-card">
      <div className="booking-card-image">
        {/* --- PASSO 3: Usar a variável 'imageUrl' aqui --- */}
        <img src={imageUrl} alt={booking.vehicle.name} />
      </div>
      <div className="booking-card-content">
        <div className="booking-card-header">
          <h3 className="booking-vehicle-name">{booking.vehicle.name}</h3>
          <span className="booking-status-badge">{booking.status}</span>
        </div>
        <div className="booking-card-details">
          <div className="detail-item"><GitBranch size={14} /> <strong>Placa:</strong> {booking.vehicle.license_plate}</div>
          <div className="detail-item"><User size={14} /> <strong>Solicitante ID:</strong> {booking.user_id}</div>
          <div className="detail-item"><Tag size={14} /> <strong>Tipo:</strong> {booking.type === 'checkout' ? 'Retirada' : 'Agendamento'}</div>
          <div className="detail-item"><Calendar size={14} /> <strong>Data:</strong> {formatDate(booking.start_time)}</div>
        </div>
        <div className="booking-card-purpose">
          <p><strong>Motivo:</strong> {booking.purpose || 'Não informado'}</p>
        </div>
        { (onApprove && onDeny) && (
          <div className="booking-card-actions">
            <button className="btn btn-success" onClick={() => onApprove(booking.id)}>Aprovar</button>
            <button className="btn btn-danger" onClick={() => onDeny(booking.id)}>Negar</button>
          </div>
        )}
      </div>
    </div>
  );
};