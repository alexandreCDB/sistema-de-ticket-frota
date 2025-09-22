//
// Arquivo: frontend/src/frota/components/VehicleCard.tsx
//
import React from 'react';
import { Vehicle } from '../services/frota.services';
import { Car, Users, Ban, Clock, Check } from 'lucide-react';

// Define um mapa de cores e textos para cada status
const statusMap = {
  available: { text: 'Disponível', color: 'bg-green-100 text-green-800' },
  'in-use': { text: 'Em Uso', color: 'bg-orange-100 text-orange-800' },
  reserved: { text: 'Reservado', color: 'bg-purple-100 text-purple-800' },
  maintenance: { text: 'Manutenção', color: 'bg-red-100 text-red-800' },
};

interface VehicleCardProps {
  vehicle: Vehicle;
}

const VehicleCard = ({ vehicle }: VehicleCardProps) => {
  const statusInfo = statusMap[vehicle.status] || { text: 'Desconhecido', color: 'bg-gray-100 text-gray-800' };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-1">
      {/* Imagem do Veículo */}
      <div className="relative">
        <img 
          src={vehicle.image_url || 'https://via.placeholder.com/400x250/cccccc/969696?text=Sem+Imagem'} 
          alt={vehicle.name} 
          className="w-full h-48 object-cover"
        />
        <span className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded-full ${statusInfo.color}`}>
          {statusInfo.text}
        </span>
      </div>

      {/* Conteúdo do Card */}
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-800">{vehicle.name}</h3>
        <p className="text-sm text-gray-500">{vehicle.model}</p>
        
        <div className="flex justify-between items-center mt-4 text-gray-600">
          <div className="flex items-center gap-2">
            <Car size={16} />
            <span className="font-mono">{vehicle.license_plate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={16} />
            <span>{vehicle.passengers || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Botões de Ação (Placeholder) */}
      <div className="p-4 bg-gray-50 border-t">
        <button disabled className="w-full bg-gray-300 text-gray-500 py-2 rounded-md">
          Ações
        </button>
      </div>
    </div>
  );
};

export default VehicleCard;