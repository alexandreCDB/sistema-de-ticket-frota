import React, { useState, useEffect, useMemo } from 'react';
import './styles.css';
import { getAllFuelSupplies, createFuelSupply } from '../../services/fuelSupply.services';
import { useVehicles } from '../../services/frota.services'; // Importar hook de veículos
import { Fuel, Calendar, Clock, Gauge, DollarSign, Car, User, Search, ChevronDown, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { VehicleSelectionModal } from '../VehicleSelectionModal';
import { FuelSupplyModal } from '../FuelSupplyModal';
import { Vehicle } from '../../types';

interface FuelSupply {
  id: number;
  vehicle_id: number;
  user_id: number;
  departure_date: string;
  departure_time: string;
  departure_km: number;
  departure_amount: number;
  return_date: string;
  return_time: string;
  return_km: number;
  return_amount: number;
  created_at: string;
  vehicle?: {
    name: string;
    license_plate: string;
  };
  user_data?: {
    email: string;
    name?: string;
  };
}

export const FuelSupplyHistory: React.FC = () => {
  const [fuelSupplies, setFuelSupplies] = useState<FuelSupply[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Estados para Lançamento Manual
  const { vehicles } = useVehicles();
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadFuelSupplies();
  }, []);

  const loadFuelSupplies = async () => {
    try {
      setIsLoading(true);
      const data = await getAllFuelSupplies();
      setFuelSupplies(data);
    } catch (err) {
      setError('Erro ao carregar histórico de abastecimentos');
      console.error('Erro:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const formatUserName = (email: string) => {
    if (!email) return 'Usuário';
    const username = email.split('@')[0];
    const formattedName = username
      .split('.')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
    return formattedName;
  };

  const filteredSupplies = fuelSupplies.filter(supply =>
    supply.vehicle?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supply.vehicle?.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supply.user_data?.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginação
  const totalPages = Math.ceil(filteredSupplies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSupplies = filteredSupplies.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const calculateTotalKm = (departureKm: number, returnKm: number) => {
    return returnKm - departureKm;
  };

  // Funções de Lançamento Manual
  const handleOpenSelectionModal = () => {
    setIsSelectionModalOpen(true);
  };

  const handleSelectVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsSelectionModalOpen(false);
    setIsFuelModalOpen(true);
  };

  const handleConfirmFuelSupply = async (fuelSupplyData: any) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Usuário não autenticado');

      const payload = JSON.parse(atob(token.split('.')[1]));
      const user_id = payload.sub;

      const completeFuelSupplyData = {
        ...fuelSupplyData,
        user_id: parseInt(user_id)
      };

      await createFuelSupply(completeFuelSupplyData);
      alert('Abastecimento lançado com sucesso!');
      setIsFuelModalOpen(false);
      setSelectedVehicle(null);
      loadFuelSupplies(); // Recarregar lista
    } catch (err) {
      console.error('Erro ao lançar abastecimento:', err);
      alert('Erro ao lançar abastecimento. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredVehiclesForSelection = useMemo(() => {
    if (!vehicles) return [];
    // Filtrar apenas veículos com monitoramento de combustível ativado
    return vehicles.filter(v => v.monitor_fuel);
  }, [vehicles]);


  // Import React.useMemo was missing in original file, added logic inside component body
  const _dummy = 0; // Placeholder

  const goToPage = (page: number) => {
    setCurrentPage(page);
    setExpandedCard(null);
  };

  if (isLoading) {
    return <div className="page-status">Carregando histórico de abastecimentos...</div>;
  }

  if (error) {
    return <div className="page-status error">{error}</div>;
  }

  return (
    <div className="fuel-supply-history">
      <div className="history-header">
        <div className="header-title">
          <Fuel size={24} />
          <h2>Histórico de Abastecimentos</h2>
          <span className="badge">{filteredSupplies.length}</span>
        </div>

        <div className="header-actions">
          <button className="btn-primary" onClick={handleOpenSelectionModal} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} />
            Lançar Abastecimento
          </button>
        </div>
      </div>

      <div className="search-bar-container" style={{ margin: '1rem 0' }}>
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por veículo, placa ou usuário..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {filteredSupplies.length === 0 ? (
        <div className="empty-state">
          <Fuel size={48} />
          <h3>Nenhum abastecimento encontrado</h3>
          <p>Quando os usuários lançarem abastecimentos, eles aparecerão aqui.</p>
        </div>
      ) : (
        <>
          <div className="supplies-list">
            {currentSupplies.map((supply) => (
              <div
                key={supply.id}
                className={`supply-card ${expandedCard === supply.id ? 'expanded' : ''}`}
                onClick={() => toggleExpand(supply.id)}
              >
                <div className="supply-header">
                  <div className="vehicle-info">
                    <Car size={18} />
                    <div className="vehicle-details">
                      <span className="vehicle-name">{supply.vehicle?.name}</span>
                      <span className="license-plate">{supply.vehicle?.license_plate}</span>
                    </div>
                  </div>

                  <div className="supply-meta">
                    <div className="user-info">
                      <User size={14} />
                      <span>{formatUserName(supply.user_data?.email || '')}</span>
                    </div>
                    <div className="date-info">
                      <Calendar size={14} />
                      <span>{formatDate(supply.departure_date)} → {formatDate(supply.return_date)}</span>
                    </div>
                  </div>

                  <button
                    className={`expand-button ${expandedCard === supply.id ? 'rotated' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(supply.id);
                    }}
                  >
                    <ChevronDown size={18} />
                  </button>
                </div>

                {/* Informações principais */}
                <div className="supply-main-info">
                  <div className="info-grid">
                    <div className="info-item">
                      <Gauge size={14} />
                      <span>KM Inicial: {supply.departure_km.toLocaleString()} km</span>
                    </div>
                    <div className="info-item">
                      <Gauge size={14} />
                      <span>KM Final: {supply.return_km.toLocaleString()} km</span>
                    </div>

                    <div className="info-item km-total">
                      <span>KM Percorrido: </span>
                      <strong>{calculateTotalKm(supply.departure_km, supply.return_km).toLocaleString()} km</strong>
                    </div>
                  </div>
                </div>

                {/* Seção expansível */}
                <div className="supply-expandable">
                  <div className="supply-details-expanded">
                    <div className="details-section">
                      <h4>Detalhes da Saída</h4>
                      <div className="details-grid">
                        <div className="detail-item">
                          <Clock size={14} />
                          <span>Hora: {supply.departure_time}</span>
                        </div>
                        <div className="detail-item">
                          <Calendar size={14} />
                          <span>Data: {formatDate(supply.departure_date)}</span>
                        </div>
                        <div className="detail-item">
                          <DollarSign size={14} />
                          <span>Valor: {formatCurrency(supply.departure_amount)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="details-section">
                      <h4>Detalhes do Retorno</h4>
                      <div className="details-grid">
                        <div className="detail-item">
                          <Clock size={14} />
                          <span>Hora: {supply.return_time}</span>
                        </div>
                        <div className="detail-item">
                          <Calendar size={14} />
                          <span>Data: {formatDate(supply.return_date)}</span>
                        </div>
                        <div className="detail-item">
                          <DollarSign size={14} />
                          <span>Valor: {formatCurrency(supply.return_amount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="supply-footer">
                  <span className="timestamp">
                    Lançado em {new Date(supply.created_at).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
                Anterior
              </button>

              <div className="pagination-info">
                Página {currentPage} de {totalPages}
              </div>

              <button
                className="pagination-btn"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Próxima
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* MODALS */}
      <VehicleSelectionModal
        isOpen={isSelectionModalOpen}
        onClose={() => setIsSelectionModalOpen(false)}
        vehicles={filteredVehiclesForSelection}
        onSelect={handleSelectVehicle}
      />

      <FuelSupplyModal
        isOpen={isFuelModalOpen}
        onClose={() => setIsFuelModalOpen(false)}
        vehicle={selectedVehicle}
        onConfirm={handleConfirmFuelSupply}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
