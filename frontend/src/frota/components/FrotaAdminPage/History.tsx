// History.tsx

import React, { useState, useMemo } from 'react';
import { HistoryList } from '../HistoryList';
import { useMyBookings } from '../../services/frota.services';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; 
import './styles.css'; 

export const History = () => {
  const { bookings, isLoading, error } = useMyBookings();

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Filtra e ORDENA reservas por status e datas
  const filteredBookings = useMemo(() => {
    if (!bookings) return [];

    const historyItems = bookings.filter((booking) => {
      const isHistoryItem = booking.status === 'completed' || booking.status === 'denied';
      if (!isHistoryItem) return false;

      const bookingDate = new Date(booking.start_time);
      const start = startDate ? new Date(startDate.setHours(0, 0, 0, 0)) : null;
      const end = endDate ? new Date(endDate.setHours(23, 59, 59, 999)) : null;

      if (start && end) return bookingDate >= start && bookingDate <= end;
      if (start) return bookingDate >= start;
      if (end) return bookingDate <= end;

      return true;
    });

    // 🆕 Adicione a ordenação aqui 🆕
    // Ordena os itens do mais novo para o mais velho
    // `(a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()`
    // compara as datas de início e retorna a diferença. Uma diferença positiva
    // coloca 'b' (o mais novo) na frente de 'a'.
    return historyItems.sort((a, b) => {
        const dateA = new Date(a.start_time).getTime();
        const dateB = new Date(b.start_time).getTime();
        return dateB - dateA;
    });

  }, [bookings, startDate, endDate]);

  if (isLoading) return <div className="page-status">A carregar histórico...</div>;
  if (error) return <div className="page-status error">{error}</div>;

  return (
    <>
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
        <HistoryList bookings={filteredBookings} />
      )}
    </>
  );
};