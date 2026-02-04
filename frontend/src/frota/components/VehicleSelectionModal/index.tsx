import React, { useState, useMemo } from 'react';
import './styles.css';
import { Vehicle } from '../../types';
import { X, Car, Search, Fuel } from 'lucide-react';

interface VehicleSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    vehicles: Vehicle[];
    onSelect: (vehicle: Vehicle) => void;
}

export const VehicleSelectionModal: React.FC<VehicleSelectionModalProps> = ({
    isOpen,
    onClose,
    vehicles,
    onSelect
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredVehicles = useMemo(() => {
        return vehicles.filter(v =>
            v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.license_plate.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [vehicles, searchTerm]);

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content vehicle-selection-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h2 className="modal-title">
                            <Fuel size={20} style={{ marginRight: '8px' }} />
                            Selecionar Veículo
                        </h2>
                        <p className="modal-subtitle">Escolha o veículo para lançar o abastecimento</p>
                    </div>
                    <button className="close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="search-wrapper" style={{ marginBottom: '1rem' }}>
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar veículo..."
                            className="search-input"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="vehicle-selection-list">
                        {filteredVehicles.length === 0 ? (
                            <p className="empty-message">Nenhum veículo encontrado.</p>
                        ) : (
                            filteredVehicles.map(vehicle => (
                                <div
                                    key={vehicle.id}
                                    className="vehicle-selection-item"
                                    onClick={() => onSelect(vehicle)}
                                >
                                    <div className="vehicle-icon-wrapper">
                                        <Car size={24} />
                                    </div>
                                    <div className="vehicle-info">
                                        <span className="vehicle-name">{vehicle.name}</span>
                                        <span className="vehicle-plate">{vehicle.license_plate}</span>
                                    </div>
                                    <button className="btn-select">Selecionar</button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
