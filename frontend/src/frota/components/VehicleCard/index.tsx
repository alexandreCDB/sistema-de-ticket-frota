import React from 'react';
import './styles.css';
import { Vehicle, Booking } from '../../types';
import { Users, CalendarCheck2, MapPin, Car, Undo2, XCircle, Fuel } from 'lucide-react';
import { useAuth } from '../../../components/AUTH/AuthContext';

// @ts-ignore
const API_URL_BASE = import.meta.env.VITE_API_URL.replace('/api', '');

interface VehicleCardProps {
  vehicle: Vehicle;
  booking?: Booking;
  lastParkingLocation?: string | null;
  onRetirar?: (vehicle: Vehicle) => void;
  onAgendar?: (vehicle: Vehicle) => void;
  onDevolver?: () => void;
  onCancelar?: () => void;
  onAbastecimento?: (vehicle: Vehicle) => void;
  isMyVehiclesPage?: boolean;
}

export function VehicleCard({
  vehicle,
  booking,
  lastParkingLocation,
  onRetirar,
  onAgendar,
  onDevolver,
  onCancelar,
  onAbastecimento,
  isMyVehiclesPage = false
}: VehicleCardProps) {
  const { user } = useAuth();

  const statusMap: Record<string, { text: string, className: string }> = {
    available: { text: 'Disponível', className: 'status-available' },
    'in-use': { text: 'Em Uso', className: 'status-in-use' },
    reserved: { text: 'Indisponível', className: 'status-maintenance' },
    maintenance: { text: 'Indisponível', className: 'status-maintenance' },
    unavailable: { text: 'Indisponível', className: 'status-maintenance' },
    pending: { text: 'Pendente', className: 'status-reserved' },
    confirmed: { text: 'Confirmado', className: 'status-confirmed' },
    denied: { text: 'Negado', className: 'status-maintenance' },
    completed: { text: 'Finalizado', className: 'status-available' },
    cancelled: { text: 'Cancelado', className: 'status-maintenance' },
  };

  // No sistema Global, o status do veículo deve ser o mesmo para todos.
  // Somente na página "Meus Veículos" mostramos o status específico da reserva do usuário.
  const displayStatus = (isMyVehiclesPage && booking) ? booking.status : vehicle.status;
  const currentStatus = statusMap[displayStatus] || { text: displayStatus, className: 'status-unknown' };

  const imageUrl = vehicle.image_url
    ? `${API_URL_BASE}${vehicle.image_url}`
    : null;

  // Lógica para verificar se a reserva pertence ao usuário logado
  const isBookingOwner = booking && user && booking.user_id === user.id;

  const renderActions = () => {
    // 🔹 PÁGINA "MEUS VEÍCULOS" - Mostra Cancelar/Devolver/Abastecimento
    // Só mostramos ações se for o dono da reserva ou um admin (admin pode devolver/cancelar qualquer um pelo backend, mas a UI foca no owner aqui)
    if (isMyVehiclesPage && booking && isBookingOwner) {

      if (booking.status === 'in-use') {
        return (
          <>
            <button className="btn-primary" style={{ backgroundColor: '#10b981' }} onClick={onDevolver}>
              <Undo2 size={16} style={{ marginRight: 8 }} /> Devolver
            </button>
            {/* ✅ BOTÃO ABASTECIMENTO - aparece apenas se monitor_fuel = true */}
            {vehicle.monitor_fuel && onAbastecimento && (
              <button className="btn-primary" style={{ backgroundColor: '#3b82f6' }} onClick={() => onAbastecimento(vehicle)}>
                <Fuel size={16} />
              </button>
            )}
          </>
        );
      }

      if (booking.status === 'confirmed') {
        if (booking.type === 'checkout') {
          return (
            <>
              <button className="btn-primary" style={{ backgroundColor: '#10b981' }} onClick={onDevolver}>
                <Undo2 size={16} style={{ marginRight: 8 }} /> Devolver
              </button>
              {/* ✅ BOTÃO ABASTECIMENTO - aparece apenas se monitor_fuel = true */}
              {vehicle.monitor_fuel && onAbastecimento && (
                <button className="btn-primary" style={{ backgroundColor: '#3b82f6' }} onClick={() => onAbastecimento(vehicle)}>
                  <Fuel size={16} />
                </button>
              )}
            </>
          );
        }

        if (booking.type === 'schedule') {
          return (
            <>
              <button className="btn-primary" style={{ backgroundColor: '#ef4444' }} onClick={onCancelar}>
                <XCircle size={16} style={{ marginRight: 8 }} /> Cancelar
              </button>
              <button className="btn-primary" style={{ backgroundColor: '#10b981' }} onClick={onDevolver}>
                <Undo2 size={16} style={{ marginRight: 8 }} /> Devolver
              </button>
            </>
          );
        }
      }

      // Se for pendente, o usuário também pode cancelar
      if (booking.status === 'pending') {
        return (
          <button className="btn-primary" style={{ backgroundColor: '#ef4444' }} onClick={onCancelar}>
            <XCircle size={16} style={{ marginRight: 8 }} /> Cancelar
          </button>
        );
      }
    }

    // 🔹 PÁGINA PRINCIPAL - Mostra Retirar/Agendar
    if (!isMyVehiclesPage) {
      // SEMPRE mostra "Retirar" quando o veículo está disponível
      if (vehicle.status === 'available' && onRetirar) {
        return (
          <>
            <button className="btn-primary" onClick={() => onRetirar(vehicle)}>
              Retirar
            </button>

            {onAgendar && (
              <button className="btn-outline" onClick={() => onAgendar(vehicle)}>
                Agendar
              </button>
            )}
          </>
        );
      }
    }

    return <button className="btn-primary" disabled style={{ width: '100%', backgroundColor: '#e5e7eb', color: '#9ca3af', cursor: 'not-allowed' }}>Indisponível</button>;
  };

  return (
    <div className="card-snake">

      {/* 1. Imagem no Topo */}
      <div className="vehicle-image-wrapper">
        {imageUrl ? (
          <img src={imageUrl} alt={vehicle.name} className="vehicle-main-image" />
        ) : (
          <div className="image-placeholder">
            <Car size={32} />
            <span>Sem imagem</span>
          </div>
        )}
      </div>

      <div className="vehicle-content">
        {/* 2. Cabeçalho: Nome e Badge */}
        <div className="vehicle-header-row">
          <div>
            <h3 className="vehicle-name">{vehicle.name}</h3>
            <span className="vehicle-plate">{vehicle.license_plate}</span>
          </div>
          <span className={`badge ${currentStatus.className}`}>
            {currentStatus.text}
          </span>
        </div>

        {/* 3. Detalhes em Lista com Ícones */}
        <div className="detail-row">
          <Users size={16} />
          <span>{vehicle.passengers || 5} passageiros</span>
        </div>

        {/* Apenas mostra localização se estiver disponível ou se for o dono (por privacidade) */}
        {(vehicle.status === 'available' || isBookingOwner || (user && user.is_admin)) && (
          <div className="detail-row">
            <MapPin size={16} />
            <span>{lastParkingLocation || 'garagem'}</span>
          </div>
        )}

        {/* Se tiver reserva própria, mostra info extra aqui também */}
        {!isMyVehiclesPage && booking && isBookingOwner && (
          <div className="detail-row" style={{ color: '#1a73e8' }}>
            <CalendarCheck2 size={16} />
            <span>Sua Reserva: {statusMap[booking.status]?.text || booking.status}</span>
          </div>
        )}

        {/* 4. Ações no Rodapé */}
        <div className="card-actions">
          {renderActions()}
        </div>
      </div>
    </div>
  );
}
