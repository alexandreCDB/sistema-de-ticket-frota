import React, { useState, useEffect } from 'react';
import { useVehicles, createVehicle, updateVehicle, deleteVehicle } from '../../services/frota.services';
import { Vehicle } from '../../types';
import { VehicleListItem } from '../VehicleListItem';
import { VehicleFormModal } from '../VehicleFormModal';
import { Pagination } from '../Pagination';
import { Plus } from 'lucide-react';
import { getWebSocket } from '../../../services/websocket';
import './styles.css';

const ITEMS_PER_PAGE = 9;

export const VehicleManagement = () => {
  const { vehicles, isLoading, error, refetchVehicles } = useVehicles();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ EFEITO: Escutar atualizações em tempo real via WebSocket
  useEffect(() => {
    const ws = getWebSocket();
    if (!ws) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "vehicle_update") {
          refetchVehicles();
        }
      } catch (err) {
        console.error("Erro ao processar mensagem WS na gestão de veículos:", err);
      }
    };

    ws.addEventListener("message", handleMessage);
    return () => ws.removeEventListener("message", handleMessage);
  }, [refetchVehicles]);

  // Paginação
  const paginatedVehicles = React.useMemo(() => {
    if (!vehicles) return [];
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return vehicles.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [vehicles, currentPage]);

  const handleOpenModal = (vehicle: Vehicle | null = null) => {
    setVehicleToEdit(vehicle);
    setIsModalOpen(true);
  };

  // MUDANÇA AQUI: Agora o refetch é chamado ao fechar a modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setVehicleToEdit(null);
    refetchVehicles(); // Garante que a lista esteja sempre atualizada ao fechar
  };

  const handleSave = async (vehicleData: any, vehicleId?: number) => {
    setIsSaving(true);
    try {
      // ✅ DEBUG 3: Verificar dados recebidos
      console.log('🔍 DEBUG 3 - Dados recebidos no handleSave:', vehicleData);

      if (vehicleId) await updateVehicle(vehicleId, vehicleData);
      else await createVehicle(vehicleData);

      // A atualização agora acontece no handleCloseModal
      handleCloseModal();
    } catch (err: any) {
      console.error('Erro ao guardar veículo:', err);
      alert(err.message || 'Erro ao guardar veículo.');
    } finally { setIsSaving(false); }
  };

  const handleDelete = async (vehicle: Vehicle) => {
    if (!window.confirm(`Tem a certeza que quer remover o veículo ${vehicle.name}?`)) return;
    try {
      await deleteVehicle(vehicle.id);
      refetchVehicles();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Erro ao remover veículo.');
    }
  };

  if (isLoading) return <div className="page-status">A carregar veículos...</div>;
  if (error) return <div className="page-status error">{error}</div>;

  return (
    <>
      <div className="management-header">
        <h3>Todos os Veículos ({vehicles?.length || 0})</h3>
        <button className="btn-primary adicionar-veiculo" onClick={() => handleOpenModal()} title="Adicionar Veículo">
          <Plus size={18} style={{ marginRight: '8px' }} /> Adicionar Veículo
        </button>
      </div>

      <div className="admin-list-container">
        {paginatedVehicles.map(v => (
          <VehicleListItem key={v.id} vehicle={v} onEdit={handleOpenModal} onDelete={handleDelete} />
        ))}
      </div>

      {vehicles && vehicles.length > ITEMS_PER_PAGE && (
        <Pagination
          currentPage={currentPage}
          totalItems={vehicles.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      )}

      <VehicleFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        vehicleToEdit={vehicleToEdit}
        isSaving={isSaving}
      />
    </>
  );
};