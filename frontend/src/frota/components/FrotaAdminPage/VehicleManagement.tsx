import React, { useState } from 'react';
import { useVehicles, createVehicle, updateVehicle, deleteVehicle } from '../../services/frota.services';
import { Vehicle } from '../../types';
import { VehicleListItem } from '../VehicleListItem';
import { VehicleFormModal } from '../VehicleFormModal';
import './styles.css';

export const VehicleManagement = () => {
  const { vehicles, isLoading, error, refetchVehicles } = useVehicles();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
        <button className="btn-primary adicionar-veiculo" onClick={() => handleOpenModal()}>Adicionar Veículo</button>
      </div>
      <div className="admin-list-container">
        {vehicles?.map(v => (
          <VehicleListItem key={v.id} vehicle={v} onEdit={handleOpenModal} onDelete={handleDelete} />
        ))}
      </div>

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