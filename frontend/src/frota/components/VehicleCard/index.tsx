import React from 'react';
import './styles.css'; 
import { Vehicle } from '../../types';
import defaultVehicleImage from '../../../assets/onix.png';
import { Users, GitBranch, MoreVertical } from 'lucide-react';

interface VehicleCardProps {
  vehicle: Vehicle;
  bookingStatus?: string;
  onRetirar?: (vehicle: Vehicle) => void;
  onDevolver?: () => void; // onDevolver não precisa mais do booking.id
  onAgendar?: (vehicle: Vehicle) => void;
  onCancelar?: () => void;
}

export function VehicleCard({ vehicle, bookingStatus, onRetirar, onDevolver, onAgendar, onCancelar }: VehicleCardProps) {
  
  const statusMap = {
    available: { text: 'Disponível', className: 'status-available' },
    'in-use': { text: 'Em Uso', className: 'status-in-use' },
    reserved: { text: 'Reservado', className: 'status-reserved' },
    maintenance: { text: 'Manutenção', className: 'status-maintenance' },
  };

  const currentStatus = statusMap[vehicle.status] || { text: 'Desconhecido', className: 'status-unknown' };
  const imageUrl = vehicle.image_url || defaultVehicleImage;

  return (
    <div className="vehicle-card">
      <div className="vehicle-header">
        <h3 className="vehicle-name">{vehicle.name}</h3>
        {vehicle.status && (
            <span className={`vehicle-status-badge ${currentStatus.className}`}>
              {currentStatus.text}
            </span>
        )}
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
        {onRetirar && (
          <button className="btn btn-primary" onClick={() => onRetirar(vehicle)}>
            Retirar Veículo
          </button>
        )}
        {onAgendar && (
          <button className="btn btn-secondary" onClick={() => onAgendar(vehicle)}>Agendar</button>
        )}
        {onDevolver && (
          <button className="btn btn-success" onClick={onDevolver}>
            Devolver Veículo
          </button>
        )}
        {onCancelar && (
          <button className="btn btn-danger" onClick={onCancelar}>
            Cancelar Reserva
          </button>
        )}
        {!(onRetirar || onAgendar || onDevolver || onCancelar) && (
            <button className="btn-disabled" disabled>
              Indisponível
            </button>
        )}
      </div>
    </div>
  );
}