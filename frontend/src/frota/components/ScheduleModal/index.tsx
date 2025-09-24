import React, { useState, FormEvent, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { addDays, getMonth, getYear } from 'date-fns';
import './styles.css';
import { Vehicle, Booking } from '../../types';
import { X, Calendar as CalendarIcon, MessageSquare, Users } from 'lucide-react';
import { createSchedule, listBookings } from '../../services/frota.services';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  onConfirm: () => void;
}

const currentYear = getYear(new Date());
const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export const ScheduleModal: React.FC<ScheduleModalProps> = ({ isOpen, onClose, vehicle, onConfirm }) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [purpose, setPurpose] = useState('');
  const [observation, setObservation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookedDates, setBookedDates] = useState<Date[]>([]);

  useEffect(() => {
    if (isOpen && vehicle) {
      const fetchBookedDates = async () => {
        try {
          const allBookings: Booking[] = await listBookings();
          const vehicleBookings = allBookings.filter(b =>
            b.vehicle_id === vehicle.id && (b.status === 'pending' || b.status === 'confirmed')
          );
          
          const dates = vehicleBookings.flatMap(b => {
            const bookedDays = [];
            let currentDay = new Date(b.start_time);
            const endDay = new Date(b.end_time || b.start_time);
            
            while (currentDay <= endDay) {
              bookedDays.push(new Date(currentDay));
              currentDay = addDays(currentDay, 1);
            }
            return bookedDays;
          });
          setBookedDates(dates);
        } catch (err) {
          console.error("Erro ao buscar datas reservadas:", err);
        }
      };
      fetchBookedDates();
    }
  }, [isOpen, vehicle]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!startDate || !endDate || !purpose) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      setIsLoading(false);
      return;
    }

    try {
      if (!vehicle) throw new Error('Nenhum veículo selecionado.');
      
      await createSchedule({
        vehicle_id: vehicle.id,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        purpose: purpose || null,
        observation: observation || null,
      });

      onConfirm();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !vehicle) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Agendar Veículo</h2>
            
          </div>
          
        </div>
        
        <form className="modal-body" onSubmit={handleSubmit}>
          
          <div className="calendar-wrapper">
            <DatePicker
              selected={startDate}
              onChange={(dates: [Date | null, Date | null]) => {
                const [start, end] = dates;
                setStartDate(start);
                setEndDate(end);
              }}
              startDate={startDate}
              endDate={endDate}
              selectsRange
              inline
              monthsShown={1}
              minDate={new Date()}
              excludeDates={bookedDates}
              highlightDates={bookedDates}
              renderCustomHeader={({
                date,
                changeYear,
                changeMonth,
                decreaseMonth,
                increaseMonth,
                prevMonthButtonDisabled,
                nextMonthButtonDisabled,
              }) => (
                <div className="react-datepicker-custom-header">
                  <button type="button" onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>
                    {"<"}
                  </button>
                  <select
                    value={getYear(date)}
                    onChange={({ target: { value } }) => changeYear(Number(value))}
                  >
                    {years.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <select
                    value={months[getMonth(date)]}
                    onChange={({ target: { value } }) =>
                      changeMonth(months.indexOf(value))
                    }
                  >
                    {months.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <button type="button" onClick={increaseMonth} disabled={nextMonthButtonDisabled}>
                    {">"}
                  </button>
                </div>
              )}
            />
          </div>

          <div className="form-group">
            <label className="form-label"><Users size={16} /> Finalidade da Viagem</label>
            <input type="text" className="form-input" placeholder="Ex: Reunião com cliente..." value={purpose} onChange={(e) => setPurpose(e.target.value)} required />
          </div>
          
          <div className="form-group">
            <label className="form-label"><MessageSquare size={16} /> Observações (Opcional)</label>
            <textarea className="form-textarea" placeholder="Informações adicionais..." value={observation} onChange={(e) => setObservation(e.target.value)} rows={3}/>
          </div>

          {error && <div className="error-box">{error}</div>}
          <div className="alert-box">
            <strong>Atenção:</strong> A sua solicitação será enviada para aprovação.
          </div>
        
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'A Enviar...' : 'Solicitar Agendamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};