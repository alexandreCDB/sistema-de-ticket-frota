import React, { useState, useMemo } from 'react';
import { HistoryItem } from '../HistoryItem';
import { useMyBookings } from '../../services/frota.services';
import DatePicker from 'react-datepicker'; // Importa o DatePicker

export const History = () => {
  const { bookings, isLoading, error } = useMyBookings();

  // --- MUDANÇA: Estados para as datas do filtro ---
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // --- MUDANÇA: Lógica para filtrar as reservas ---
  const filteredBookings = useMemo(() => {
    if (!bookings) return [];

    return bookings.filter(booking => {
      // Filtra primeiro pelo status
      const isHistoryItem = booking.status === 'completed' || booking.status === 'denied';
      if (!isHistoryItem) return false;

      // Se não houver datas selecionadas, não filtra por data
      if (!startDate && !endDate) return true;

      // Converte a data da reserva para um objeto Date
      const bookingDate = new Date(booking.start_time);
      
      // Lógica de filtragem por período
      const start = startDate ? new Date(startDate.setHours(0, 0, 0, 0)) : null;
      const end = endDate ? new Date(endDate.setHours(23, 59, 59, 999)) : null;

      if (start && end) {
        return bookingDate >= start && bookingDate <= end;
      }
      if (start) {
        return bookingDate >= start;
      }
      if (end) {
        return bookingDate <= end;
      }
      return true;
    });
  }, [bookings, startDate, endDate]);


  if (isLoading) return <div className="page-status">A carregar histórico...</div>;
  if (error) return <div className="page-status error">{error}</div>;

  return (
    <>
      {/* --- MUDANÇA: Adicionado o container de filtros --- */}
      <div className="history-filters">
        <div className="filter-group">
          <label>Data de Início</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            className="date-picker-input"
            dateFormat="dd/MM/yyyy"
            placeholderText="DD/MM/AAAA"
          />
        </div>
        <div className="filter-group">
          <label>Data de Fim</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            className="date-picker-input"
            dateFormat="dd/MM/yyyy"
            placeholderText="DD/MM/AAAA"
          />
        </div>
        <button 
          className="clear-filter-button" 
          onClick={() => {
            setStartDate(null);
            setEndDate(null);
          }}
        >
          Limpar Filtro
        </button>
      </div>

      {filteredBookings.length === 0 ? (
        <p className="empty-message">Nenhuma reserva encontrada para o período selecionado.</p>
      ) : (
        <div className="admin-list-container">
          {filteredBookings.map(booking => (
            <HistoryItem
              key={booking.id}  
              booking={booking}
            />
          ))}
        </div>
      )}
    </>
  );
};