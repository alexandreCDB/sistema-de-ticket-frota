import React, { useState, useMemo, useEffect } from 'react';
import '../styles/frota.css';
import './ListaVeiculosPage.css';
import { useAuth } from '../../components/AUTH/AuthContext';
import { useVehiclesWithBookings } from '../services/frota.services';
import { Dashboard } from '../components/Dashboard';
import { VehicleCard } from '../components/VehicleCard';
import { CheckoutModal } from '../components/CheckoutModal';
import { ScheduleModal } from '../components/ScheduleModal';
import { SuccessToast } from '../components/SucessToast';
import { VehicleWithBookings } from '../types';
import { FrotaHeader } from '../components/Header';
import Loading from '../../components/Loads/Loading';
import { Search } from 'lucide-react';
// 1. IMPORTAÇÃO DO COMPONENTE DE PAGINAÇÃO
import { Pagination } from '../components/Pagination';

export default function ListaVeiculosPage() {
  const { user, loadingUser } = useAuth();
  const { vehicles, isLoading, error, refetchVehicles } = useVehiclesWithBookings();

  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithBookings | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'in-use' | 'maintenance'>('all'); // ✅ NOVO FILTRO

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchRef = React.useRef<HTMLDivElement>(null);

  // Fechar busca ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node) && !searchTerm) {
        setIsSearchExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchTerm]);

  const handleOpenCheckoutModal = (vehicle: VehicleWithBookings) => {
    setSelectedVehicle(vehicle);
    setIsCheckoutModalOpen(true);
  };

  const handleOpenScheduleModal = (vehicle: VehicleWithBookings) => {
    setSelectedVehicle(vehicle);
    setIsScheduleModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCheckoutModalOpen(false);
    setIsScheduleModalOpen(false);
    setSelectedVehicle(null);
  };

  const handleSuccess = () => {
    handleCloseModal();
    refetchVehicles();
    setToastMessage("Solicitação enviada com sucesso para aprovação!");
  };

  const filteredVehicles = useMemo(() => {
    if (!vehicles) return [];

    let result = [...vehicles];

    // ✅ FILTRO POR STATUS
    if (filterStatus !== 'all') {
      result = result.filter(v => {
        if (filterStatus === 'maintenance') return v.status === 'unavailable' || v.status === 'maintenance';
        return v.status === filterStatus;
      });
    }

    const sortedVehicles = result.sort((a, b) => {
      // ✅ PRIMEIRO: Ordenar por categoria (carro primeiro, depois caminhão)
      const categoryPriority: Record<string, number> = {
        'carro': 1,
        'caminhao': 2
      };
      const catA = categoryPriority[a.categories || ''] || 99;
      const catB = categoryPriority[b.categories || ''] || 99;

      if (catA !== catB) {
        return catA - catB;
      }

      // ✅ DEPOIS: Ordenar por status dentro de cada categoria
      const statusPriority: Record<string, number> = {
        'available': 1,
        'in-use': 2,
        'reserved': 3,
        'maintenance': 4,
        'unavailable': 5
      };
      const pA = statusPriority[a.status] || 99;
      const pB = statusPriority[b.status] || 99;
      return pA - pB;
    });

    if (!searchTerm) {
      return sortedVehicles;
    }

    return sortedVehicles.filter(vehicle =>
      vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle.model && vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [vehicles, searchTerm, filterStatus]);

  // 3. NOVO EFEITO PARA RESETAR A PÁGINA AO BUSCAR
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // 4. NOVA LÓGICA PARA "FATIAR" OS RESULTADOS
  const paginatedVehicles = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredVehicles.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredVehicles, currentPage]);

  if (loadingUser || isLoading) {
    return (
      <div className="frota-module">
        <FrotaHeader />
        <div className="page-status"><Loading /></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="frota-module">
        <FrotaHeader />
        <div className="page-status error">Erro: {error}</div>
      </div>
    );
  }


  return (
    <div className="frota-module">
      <FrotaHeader />
      <main className="frota-container page-layout">
        <section>
          <h2 className="section-title">Dashboard de Veículos</h2>
          <Dashboard vehicles={filteredVehicles || []} />
        </section>
        <section>
          <div className="list-header">
            <div className="status-filters">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'available', label: 'Disponível' },
                { id: 'in-use', label: 'Em Uso' },
                { id: 'maintenance', label: 'Manutenção' }
              ].map((pill) => (
                <button
                  key={pill.id}
                  className={`filter-pill ${filterStatus === pill.id ? 'active' : ''}`}
                  onClick={() => setFilterStatus(pill.id as any)}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            <div
              ref={searchRef}
              className={`search-container ${isSearchExpanded || searchTerm ? 'expanded' : ''}`}
              onClick={() => setIsSearchExpanded(true)}
            >
              <div className="search-icon-wrapper">
                <Search size={20} className="search-icon-lucide" />
              </div>
              <input
                type="text"
                placeholder="Pesquisar frota..."
                className="search-input-modern"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onFocus={() => setIsSearchExpanded(true)}
                autoFocus={isSearchExpanded}
              />
            </div>
          </div>

          <div className="vehicle-grid">
            {/* 5. ALTERADO para usar 'paginatedVehicles' */}
            {paginatedVehicles && paginatedVehicles.length > 0 ? (
              paginatedVehicles.map((vehicle) => {
                const lastCompletedBooking = vehicle.bookings
                  .filter(b => b.status === 'completed' && b.parking_location)
                  .sort((a, b) => new Date(b.end_time!).getTime() - new Date(a.end_time!).getTime())[0];

                const lastParkingLocation = lastCompletedBooking ? lastCompletedBooking.parking_location : null;

                const activeBookingForUser = vehicle.bookings.find(b =>
                  b.user_id === user?.id && ['in-use', 'reserved', 'pending', 'confirmed'].includes(b.status)
                );

                return (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    booking={activeBookingForUser}
                    lastParkingLocation={lastParkingLocation}
                    onRetirar={() => handleOpenCheckoutModal(vehicle)}
                    onAgendar={() => handleOpenScheduleModal(vehicle)}
                  />
                );
              })
            ) : (
              <p>Nenhum veículo encontrado.</p>
            )}
          </div>

          {/* 6. ADICIONADO o componente de paginação */}
          <Pagination
            currentPage={currentPage}
            totalItems={filteredVehicles.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </section>
      </main>

      {/* Modais e Toast (sem alterações) */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={handleCloseModal}
        vehicle={selectedVehicle}
        onConfirm={handleSuccess}
      />
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={handleCloseModal}
        vehicle={selectedVehicle}
        onConfirm={handleSuccess}
      />
      {toastMessage && (
        <SuccessToast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}