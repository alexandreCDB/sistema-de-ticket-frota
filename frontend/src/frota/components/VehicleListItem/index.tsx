import React from 'react';
import './styles.css';
import { Vehicle } from '../../types';
import { Car, Pencil, Trash2 } from 'lucide-react';

interface VehicleListItemProps {
  vehicle: Vehicle;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
}

export const VehicleListItem: React.FC<VehicleListItemProps> = ({ vehicle, onEdit, onDelete }) => {
  return (
    <div className="vehicle-list-item">
      <div className="item-icon-wrapper">
        <Car size={20} />
      </div>
      <div className="item-info-main">
        <h4>{vehicle.name}</h4>
        <p>{vehicle.license_plate}</p>
      </div>
      <div className="item-info-secondary">
        <p><strong>Modelo:</strong> {vehicle.model || 'N/A'}</p>
        <p><strong>Passageiros:</strong> {vehicle.passengers || 'N/A'}</p>
      </div>
      <div className="item-info-status">
        <span className={`status-pill status-${vehicle.status}`}>{vehicle.status}</span>
      </div>
      <div className="item-list-actions">
        <button className="btn-icon" onClick={() => onEdit(vehicle)} title="Editar"><Pencil size={16} /></button>
        <button className="btn-icon btn-icon-danger" onClick={() => onDelete(vehicle)} title="Remover"><Trash2 size={16} /></button>
      </div>
    </div>
  );
};