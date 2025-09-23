// src/frota/components/VehicleCard/index.tsx

import React from 'react';
import './styles.css'; 
import { Vehicle } from '../../../frota/types';
import defaultVehicleImage from '../../../assets/onix.png'; 
import { Users, GitBranch, MoreVertical } from 'lucide-react';

// Define as propriedades que o componente espera receber
interface VehicleCardProps {
  vehicle: Vehicle;
  onRetirar: (vehicle: Vehicle) => void; // A função para abrir o modal
}

export function VehicleCard({ vehicle, onRetirar }: VehicleCardProps) {
  
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
        {/* Você pode adicionar outros detalhes aqui conforme necessário */}
      </div>

      <div className="vehicle-actions">
        {vehicle.status === 'available' ? (
          <>
            {/* Adiciona o onClick para chamar a função que abre o modal */}
            <button className="btn btn-primary" onClick={() => onRetirar(vehicle)}>
              Retirar Veículo
            </button>
            <button className="btn btn-secondary">Agendar</button>
          </>
        ) : vehicle.status === 'in-use' ? (
          <button className="btn btn-success">Devolver Veículo</button>
        ) : (
          <button className="btn-disabled" disabled>
            Indisponível
          </button>
        )}
      </div>
    </div>
  );
}