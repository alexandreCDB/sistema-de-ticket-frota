import React from 'react';
import './styles.css'; 
import { Vehicle, Booking } from '../../types';
import defaultVehicleImage from '../../../assets/onix.png';
import { Users, GitBranch, XCircle, Undo2, CalendarCheck2 } from 'lucide-react';

// --- ADICIONADO: Pega a base do URL da sua API ---
// @ts-ignore
const API_URL_BASE = import.meta.env.VITE_API_URL.replace('/api', ''); // ex: http://localhost:8000

interface VehicleCardProps {
  vehicle: Vehicle;
  booking?: Booking;
  onRetirar?: (vehicle: Vehicle) => void;
  onAgendar?: (vehicle: Vehicle) => void;
  onDevolver?: () => void;
  onCancelar?: () => void;
}

export function VehicleCard({ vehicle, booking, onRetirar, onAgendar, onDevolver, onCancelar }: VehicleCardProps) {
  
  const statusMap = {
    available: { text: 'Disponível', className: 'status-available' },
    'in-use': { text: 'Em Uso', className: 'status-in-use' },
    reserved: { text: 'Reservado', className: 'status-reserved' },
    maintenance: { text: 'Manutenção', className: 'status-maintenance' },
    pending: { text: 'Pendente', className: 'status-reserved' },
    confirmed: { text: 'Confirmado', className: 'status-available' },
  };

  const displayStatus = booking?.status || vehicle.status;
  const currentStatus = statusMap[displayStatus] || { text: displayStatus, className: 'status-unknown' };

  // --- CORREÇÃO: Monta a URL completa da imagem ---
  const imageUrl = vehicle.image_url 
    ? `${API_URL_BASE}${vehicle.image_url}` // Junta a base do servidor com o caminho da imagem
    : defaultVehicleImage; // Usa a imagem padrão se não houver URL

  // --- LÓGICA DE RENDERIZAÇÃO DOS BOTÕES (inalterada) ---
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
        <img src={imageUrl} alt={vehicle.name} className="vehicle-main-image" />
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
      </div>

      <div className="vehicle-actions">
        {renderActions()}
      </div>
    </div>
  );
}