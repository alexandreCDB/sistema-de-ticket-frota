import React from 'react';
import './styles.css';
import { Vehicle } from '../../types';
import { Car, Settings, Trash2 } from 'lucide-react';

interface VehicleListItemProps {
  vehicle: Vehicle;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
}

export const VehicleListItem: React.FC<VehicleListItemProps> = ({ vehicle, onEdit, onDelete }) => {
  // @ts-ignore
  const API_URL_BASE = (import.meta as any).env?.VITE_API_URL?.replace('/api', '') || '';
  const imageUrl = vehicle.image_url ? `${API_URL_BASE}${vehicle.image_url}` : null;

  return (
    <div className="vehicle-list-item">
      <div className="item-thumbnail">
        {imageUrl ? (
          <img src={imageUrl} alt={vehicle.name} />
        ) : (
          <Car size={20} />
        )}
      </div>
      <div className="item-info">
        <h4 className="item-name">{vehicle.name}</h4>
        <p className="item-plate">{vehicle.license_plate}</p>
      </div>
      <div className="item-actions">
        <button className="icon-btn btn-edit" onClick={() => onEdit(vehicle)} title="Editar">
          <Settings size={18} />
        </button>
        <button className="icon-btn btn-delete" onClick={() => onDelete(vehicle)} title="Remover">
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};