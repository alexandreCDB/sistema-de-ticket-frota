import { getWebSocket } from '../../../services/websocket';
import React, { useState, useEffect } from 'react';
import './styles.css';
import { usePersonalBookings, completeReturn, cancelBooking, departVehicle } from '../../services/frota.services';
import { FrotaHeader } from '../../components/Header';
import { VehicleCard } from '../../components/VehicleCard';
import { ReturnVehicleModal } from '../../components/ReturnVehicleModal';
import { FuelSupplyModal } from '../../components/FuelSupplyModal';
import { createFuelSupply } from '../../services/fuelSupply.services';
import { BookingWithVehicle } from '../../types';
import { DepartVehicleModal } from '../../components/DepartVehicleModal';

export default function MeusVeiculosPage() {
  const { bookings, isLoading, error, refetchBookings } = usePersonalBookings();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithVehicle | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ NOVOS ESTADOS PARA MODAL DE ABASTECIMENTO
  const [isFuelSupplyModalOpen, setIsFuelSupplyModalOpen] = useState(false);
  const [selectedVehicleForFuel, setSelectedVehicleForFuel] = useState<any>(null);
  const [isFuelSubmitting, setIsFuelSubmitting] = useState(false);

  // ✅ NOVOS ESTADOS PARA MODAL DE SAÍDA
  const [isDepartModalOpen, setIsDepartModalOpen] = useState(false);
  const [isDepartSubmitting, setIsDepartSubmitting] = useState(false);

  // ✅ EFEITO: Escutar atualizações em tempo real via WebSocket
  useEffect(() => {
    const ws = getWebSocket();
    if (!ws) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "vehicle_update") {
          console.log("🔄 Recebido sinal de atualização de veículos via WS (Meus Veículos)");
          refetchBookings();
        }
      } catch (err) {
        console.error("Erro ao processar mensagem WS em Meus Veículos:", err);
      }
    };

    ws.addEventListener("message", handleMessage);
    return () => ws.removeEventListener("message", handleMessage);
  }, [refetchBookings]);

  const handleOpenReturnModal = (booking: BookingWithVehicle) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleCloseReturnModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  // ✅ NOVA FUNÇÃO: Abrir modal de abastecimento
  const handleOpenFuelSupplyModal = (vehicle: any) => {
    setSelectedVehicleForFuel(vehicle);
    setIsFuelSupplyModalOpen(true);
  };

  // ✅ NOVA FUNÇÃO: Fechar modal de abastecimento
  const handleCloseFuelSupplyModal = () => {
    setIsFuelSupplyModalOpen(false);
    setSelectedVehicleForFuel(null);
  };

  const handleOpenDepartModal = (booking: BookingWithVehicle) => {
    setSelectedBooking(booking);
    setIsDepartModalOpen(true);
  };

  const handleCloseDepartModal = () => {
    setIsDepartModalOpen(false);
    setSelectedBooking(null);
  };

  const handleConfirmReturn = async (bookingId: number, endMileage: number, parkingLocation: string) => {
    setIsSubmitting(true);
    try {
      await completeReturn(bookingId, { end_mileage: endMileage, parking_location: parkingLocation });
      alert('Veículo devolvido com sucesso!');
      handleCloseReturnModal();
      refetchBookings();
    } catch (err) {
      console.error('Erro ao devolver veículo:', err);
      alert('Erro ao devolver veículo. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    const confirmCancel = window.confirm("Tem certeza que deseja cancelar esta reserva?");
    if (!confirmCancel) return;

    try {
      await cancelBooking(bookingId);
      alert("Reserva cancelada com sucesso!");
      refetchBookings();
    } catch (err) {
      console.error('Erro ao cancelar reserva:', err);
      alert('Erro ao cancelar reserva. Tente novamente.');
    }
  };

  const handleConfirmSair = async (bookingId: number, startMileage: number) => {
    setIsDepartSubmitting(true);
    try {
      await departVehicle(bookingId, { start_mileage: startMileage });
      alert('Saída registrada com sucesso! Boa viagem.');
      handleCloseDepartModal();
      refetchBookings();
    } catch (err) {
      console.error('Erro ao registrar saída:', err);
      throw err; // Repassa para o modal mostrar o erro
    } finally {
      setIsDepartSubmitting(false);
    }
  };

  const handleConfirmFuelSupply = async (fuelSupplyData: any) => {
    setIsFuelSubmitting(true);
    try {
      // ✅ PEGAR USER_ID DO TOKEN
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Usuário não autenticado');

      const payload = JSON.parse(atob(token.split('.')[1]));
      const user_id = payload.sub; // O 'sub' do JWT contém o user_id

      const completeFuelSupplyData = {
        ...fuelSupplyData,
        user_id: parseInt(user_id) // ✅ AGORA COM USER_ID CORRETO
      };

      await createFuelSupply(completeFuelSupplyData);
      alert('Abastecimento lançado com sucesso!');
      handleCloseFuelSupplyModal();
      refetchBookings();
    } catch (err) {
      console.error('Erro ao lançar abastecimento:', err);
      alert('Erro ao lançar abastecimento. Tente novamente.');
    } finally {
      setIsFuelSubmitting(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="page-status">A carregar os seus veículos...</div>;
    }

    if (error) {
      return <div className="page-status error">{error}</div>;
    }

    //@ts-ignore
    const approvedBookings = bookings?.filter(b => b.status === 'in-use' || b.status === 'confirmed') || [];

    if (approvedBookings.length === 0) {
      return <p className="empty-message">Você não tem veículos retirados ou agendamentos confirmados no momento.</p>;
    }

    return (
      <div className="vehicle-grid">
        {approvedBookings.map((booking) => (
          <VehicleCard
            key={booking.id}
            vehicle={booking.vehicle}
            booking={booking}
            onDevolver={() => handleOpenReturnModal(booking)}
            onSair={() => handleOpenDepartModal(booking)}
            onCancelar={() => handleCancelBooking(booking.id)}
            onAbastecimento={() => handleOpenFuelSupplyModal(booking.vehicle)} // ✅ NOVA PROP
            isMyVehiclesPage={true}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="frota-module">
      <FrotaHeader />
      <main className="frota-container page-layout">
        <section>
          <h2 className="section-title">Meus Veículos</h2>

          {renderContent()}
        </section>

        {/* Modal de Devolução */}
        <ReturnVehicleModal
          isOpen={isModalOpen}
          onClose={handleCloseReturnModal}
          onConfirmReturn={handleConfirmReturn}
          booking={selectedBooking}
          isSubmitting={isSubmitting}
        />

        {/* ✅ NOVO MODAL: Abastecimento */}
        <FuelSupplyModal
          isOpen={isFuelSupplyModalOpen}
          onClose={handleCloseFuelSupplyModal}
          onConfirm={handleConfirmFuelSupply}
          vehicle={selectedVehicleForFuel}
          isSubmitting={isFuelSubmitting}
        />

        {/* ✅ NOVO MODAL: Saída */}
        <DepartVehicleModal
          isOpen={isDepartModalOpen}
          onClose={handleCloseDepartModal}
          onConfirm={handleConfirmSair}
          booking={selectedBooking}
          isSubmitting={isDepartSubmitting}
        />
      </main>
    </div>
  );
}