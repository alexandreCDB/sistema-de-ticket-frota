import React, { useState, useMemo } from 'react';
import { HistoryList } from '../HistoryList';
import { useMyBookings, useVehicles } from '../../services/frota.services';
import { Vehicle } from '../../types';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; 
import './styles.css'; 
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react';

const CustomHeader = ({
  date,
  decreaseMonth,
  increaseMonth,
  prevMonthButtonDisabled,
  nextMonthButtonDisabled,
}: any) => (
  <div className="datepicker-custom-header">
    <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled} className="nav-button">
      <ChevronLeft size={18} />
    </button>
    <span className="month-year-display">
      {format(date, "MMMM 'de' yyyy", { locale: ptBR })}
    </span>
    <button onClick={increaseMonth} disabled={nextMonthButtonDisabled} className="nav-button">
      <ChevronRight size={18} />
    </button>
  </div>
);


export const History = () => {
  const { bookings, isLoading: isLoadingBookings, error: errorBookings } = useMyBookings();
  const { vehicles, isLoading: isLoadingVehicles } = useVehicles();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // --- LÓGICA DE FILTRO RESTAURADA ---
  const filteredBookings = useMemo(() => {
    if (!bookings) return [];

    const historyItems = bookings.filter((booking) => {
      const isHistoryItem = booking.status === 'completed' || booking.status === 'denied';
      if (!isHistoryItem) return false;

      const bookingDate = new Date(booking.start_time);
      const start = startDate ? new Date(startDate.setHours(0, 0, 0, 0)) : null;
      const end = endDate ? new Date(endDate.setHours(23, 59, 59, 999)) : null;

      if (start && end && (bookingDate < start || bookingDate > end)) return false;
      if (start && bookingDate < start) return false;
      if (end && bookingDate > end) return false;
      
      if (selectedVehicleId && booking.vehicle.id !== parseInt(selectedVehicleId)) {
        return false;
      }
      
      return true;
    });

    return historyItems.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
  }, [bookings, startDate, endDate, selectedVehicleId]);

  // --- LÓGICA DE EXPORTAÇÃO RESTAURADA ---
  const handleExportExcel = () => {
    const dataToExport = filteredBookings.map(booking => ({
      'Veículo': booking.vehicle.name,
      'Placa': booking.vehicle.license_plate,
      'Usuário': booking.user?.email || `ID ${booking.user_id}`,
      'Data de Saída': new Date(booking.start_time).toLocaleDateString('pt-BR'),
      'Hora de Saída': new Date(booking.start_time).toLocaleTimeString('pt-BR'),
      'Data de Volta': booking.end_time ? new Date(booking.end_time).toLocaleDateString('pt-BR') : 'N/A',
      'Hora de Volta': booking.end_time ? new Date(booking.end_time).toLocaleTimeString('pt-BR') : 'N/A',
      'Status': booking.status === 'completed' ? 'Concluída' : 'Negada',
      'Finalidade': booking.purpose,
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Histórico da Frota");
    XLSX.writeFile(workbook, "historico_frota.xlsx");
  };

  if (isLoadingBookings || isLoadingVehicles) return <div className="page-status">A carregar histórico...</div>;
  if (errorBookings) return <div className="page-status error">{errorBookings}</div>;

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
            renderCustomHeader={CustomHeader}
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
            renderCustomHeader={CustomHeader}
          />
        </div>
        <div className="filter-group">
          <label>Filtrar por Veículo</label>
          <select 
            className="vehicle-filter-select"
            value={selectedVehicleId}
            onChange={(e) => setSelectedVehicleId(e.target.value)}
          >
            <option value="">Todos os Veículos</option>
            {vehicles?.map((vehicle: Vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.name} ({vehicle.license_plate})
              </option>
            ))}
          </select>
        </div>
        <button
          className="clear-filter-button"
          onClick={() => {
            setStartDate(null);
            setEndDate(null);
            setSelectedVehicleId('');
          }}
        >
          Limpar Filtros
        </button>
        <button 
          className="export-button" 
          onClick={handleExportExcel}
          title="Exportar para Excel"
        >
          <FileSpreadsheet size={20} />
        </button>
      </div>

      {filteredBookings.length === 0 ? (
        <p className="empty-message">Nenhuma reserva encontrada para os filtros selecionados.</p>
      ) : (
        <HistoryList bookings={filteredBookings} />
      )}
    </>
  );
};