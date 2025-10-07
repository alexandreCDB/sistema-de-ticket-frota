import React from 'react';
import './styles.css';
import { Vehicle, Booking } from '../../types';
import { Users, GitBranch, XCircle, Undo2, CalendarCheck2, MapPin, Car } from 'lucide-react'; // Adicionado ícone 'Car'

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
}

export function VehicleCard({ vehicle, booking, lastParkingLocation, onRetirar, onAgendar, onDevolver, onCancelar }: VehicleCardProps) {
  
  const statusMap = {
    available: { text: 'Disponível', className: 'status-available' },
    'in-use': { text: 'Em Uso', className: 'status-in-use' },
    reserved: { text: 'Reservado', className: 'status-reserved' },
    maintenance: { text: 'Manutenção', className: 'status-maintenance' },
    unavailable: { text: 'Indisponível', className: 'status-maintenance' },
    pending: { text: 'Pendente', className: 'status-reserved' },
    confirmed: { text: 'Confirmado', className: 'status-available' },
  };

  const displayStatus = booking?.status || vehicle.status;
  const currentStatus = statusMap[displayStatus] || { text: displayStatus, className: 'status-unknown' };

  // 2. ALTERADO: A lógica agora retorna a URL completa ou null se não houver imagem
  const imageUrl = vehicle.image_url 
    ? `${API_URL_BASE}${vehicle.image_url}`
    : null;

  const renderActions = () => {
    if (booking) {
      if (booking.status === 'in-use') {
        return <button className="btn btn-success" onClick={onDevolver}><Undo2 size={16}/> Devolver Veículo</button>;
      }
      if (booking.status === 'confirmed') {
        if (booking.type === 'checkout') {
          return <button className="btn btn-success" onClick={onDevolver}><Undo2 size={16}/> Devolver Veículo</button>;
        }
        if (booking.type === 'schedule') {
          return (
            <>
              <button className="btn btn-danger" onClick={onCancelar}><XCircle size={16}/> Cancelar</button>
              <button className="btn btn-success" onClick={onDevolver}><Undo2 size={16}/> Devolver</button>
            </>
          );
        }
      }
    }
    if (onRetirar && onAgendar && vehicle.status === 'available') {
      return (
        <>
          <button className="btn btn-primary" onClick={() => onRetirar(vehicle)}>Retirar Veículo</button>
          <button className="btn btn-secondary" onClick={() => onAgendar(vehicle)}><CalendarCheck2 size={16}/> Agendar</button>
        </>
      );
    }
    return <button className="btn-disabled" disabled>Indisponível</button>;
  };

  return (
    <div className="vehicle-card">
      <div className="vehicle-header">
        <h3 className="vehicle-name">{vehicle.name}</h3>
        <span className={`vehicle-status-badge ${currentStatus.className}`}>
          {currentStatus.text}
        </span>
      </div>
      
      <div className="vehicle-image-wrapper">
        {/* 3. ALTERADO: Renderização condicional da imagem */}
        {imageUrl ? (
          <img src={imageUrl} alt={vehicle.name} className="vehicle-main-image" />
        ) : (
          <div className="image-placeholder">
            <Car size={48} />
            <span>Sem imagem</span>
          </div>
        )}
      </div>

      <div className="vehicle-details-grid">
        <div className="detail-item">
          <span className="detail-label">Modelo:</span>
          <span className="detail-value">{vehicle.model}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Placa:</span>
          <span className="detail-value">{vehicle.license_plate}</span>
        </div>
        {vehicle.passengers && (
          <div className="detail-item">
            <span className="detail-label">Passageiros:</span>
            <span className="detail-value">{vehicle.passengers}</span>
          </div>
        )}
        
        <div className="detail-item">
          <span className="detail-label"><MapPin size={14} /> Última Posição:</span>
          <span className="detail-value">{lastParkingLocation || 'Pátio'}</span>
        </div>
      </div>

      <div className="vehicle-actions">
        {renderActions()}
      </div>
    </div>
  );
}