import React, { useEffect, useState } from 'react';
import { FrotaHeader } from '../../components/Header';
import { BookingCard } from '../../components/BookingCard';
import { listBookings, approveBooking, denyBooking, getVehicle } from '../../services/frota.services';
import { Booking, Vehicle } from '../../types';
import './styles.css';

interface BookingWithVehicle extends Booking {
  vehicle: Vehicle;
}

export default function FrotaAdminPage() {
  const [bookings, setBookings] = useState<BookingWithVehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      // Agora o TypeScript sabe que 'response' é um array de Booking
      const response: Booking[] = await listBookings();
      const pendingBookings = response.filter(b => b.status === 'pending');

      const bookingsWithVehicles = await Promise.all(
        pendingBookings.map(async (booking: Booking) => {
          const vehicle = await getVehicle(booking.vehicle_id);
          return { ...booking, vehicle };
        })
      );

      setBookings(bookingsWithVehicles);
    } catch (err) {
      console.error("Erro ao buscar solicitações:", err);
      setError("Não foi possível carregar as solicitações.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleApprove = async (bookingId: number) => {
    try {
      await approveBooking(bookingId);
      fetchBookings();
      alert('Reserva aprovada com sucesso!');
    } catch (err) {
      console.error("Erro ao aprovar:", err);
      alert('Erro ao aprovar a reserva. Tente novamente.');
    }
  };

  const handleDeny = async (bookingId: number) => {
    try {
      await denyBooking(bookingId);
      fetchBookings();
      alert('Reserva negada com sucesso!');
    } catch (err) {
      console.error("Erro ao negar:", err);
      alert('Erro ao negar a reserva. Tente novamente.');
    }
  };

  return (
    <div className="frota-module">
      <FrotaHeader />
      <main className="frota-container page-layout">
        <section>
          <h2 className="section-title">Painel do Administrador</h2>
          <p className="section-subtitle">Gerenciar solicitações de reserva e retirada de veículos.</p>
          
          {isLoading && <div className="page-status">A carregar solicitações...</div>}
          {error && <div className="page-status error">{error}</div>}
          
          {!isLoading && bookings.length === 0 && (
            <p className="empty-message">Nenhuma solicitação pendente no momento.</p>
          )}

          {!isLoading && bookings.length > 0 && (
            <div className="admin-grid">
              {bookings.map(booking => (
                <BookingCard 
                  key={booking.id} 
                  booking={booking}
                  vehicle={booking.vehicle}
                  onApprove={handleApprove}
                  onDeny={handleDeny}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}