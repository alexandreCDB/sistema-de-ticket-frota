import React, { useState, FormEvent, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { addDays, isSameDay } from 'date-fns';

// Ícones para os botões de navegação
import { ChevronLeft, ChevronRight, AlertTriangle, Check, ChevronDown, ChevronUp, FileText } from 'lucide-react'; 

//@ts-ignore
import 'react-datepicker/dist/react-datepicker.css';
//@ts-ignore
import './styles.css';

import { Vehicle, Booking } from '../../types';
import { X, Clock, MessageSquare, Users } from 'lucide-react';
import { createSchedule, listBookings } from '../../services/frota.services';

// Array de meses para o seletor
const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  onConfirm: () => void;
}

// --- COMPONENTE DO CABEÇALHO CUSTOMIZADO ---
const CustomHeader = ({
  date,
  changeYear,
  changeMonth,
  decreaseMonth,
  increaseMonth,
  prevMonthButtonDisabled,
  nextMonthButtonDisabled,
}: any) => {
  const currentYear = new Date().getFullYear();
  // Gera uma lista de anos (ex: de 2020 a 2030)
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="react-datepicker-custom-header">
      <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled} className="nav-button">
        <ChevronLeft size={20} />
      </button>
      
      <div className="header-selects">
        <select
          value={months[date.getMonth()]}
          onChange={({ target: { value } }) => changeMonth(months.indexOf(value))}
          className="month-select"
        >
          {months.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <select
          value={date.getFullYear()}
          onChange={({ target: { value } }) => changeYear(parseInt(value))}
          className="year-select"
        >
          {years.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <button onClick={increaseMonth} disabled={nextMonthButtonDisabled} className="nav-button">
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export const ScheduleModal: React.FC<ScheduleModalProps> = ({ isOpen, onClose, vehicle, onConfirm }) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [purpose, setPurpose] = useState('');
  const [observation, setObservation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  
  // ✅ NOVOS ESTADOS PARA O TERMO
  const [aceitouTermo, setAceitouTermo] = useState(false);
  const [termoExpandido, setTermoExpandido] = useState(false);

  useEffect(() => {
    if (isOpen && vehicle) {
      setStartDate(null);
      setEndDate(null);
      setPurpose('');
      setObservation('');
      setError(null);
      setAceitouTermo(false);
      setTermoExpandido(false);

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

  // ✅ TERMO DE RESPONSABILIDADE (MESMO DO CHECKOUT)
  const termoResponsabilidade = `
    TERMO DE RESPONSABILIDADE E COMPROMISSO

    Eu, abaixo identificado, declaro estar ciente e concordo integralmente com as seguintes condições para a retirada e utilização do veículo:

    1. O veículo deverá ser utilizado exclusivamente para fins profissionais relacionados às atividades da empresa;

    2. Comprometo-me a dirigir com atenção, responsabilidade e em conformidade com as leis de trânsito;

    3. O veículo não poderá ser utilizado por terceiros não autorizados;

    4. Em caso de acidente, devo comunicar imediatamente à administração e registrar ocorrência policial quando necessário;

    5. Sou responsável por quaisquer multas de trânsito aplicadas durante o período de uso;

    6. Comprometo-me a devolver o veículo no prazo estipulado, em perfeitas condições de uso;

    7. O veículo deverá ser abastecido quando o nível do combustível estiver abaixo de 1/4 do tanque;

    8. Qualquer avaria ou problema técnico deve ser comunicado imediatamente;

    9. É proibido o transporte de carga excessiva ou materiais perigosos;

    10. Em caso de descumprimento destas normas, estou sujeito às penalidades previstas no regulamento interno.

    Declaro estar ciente de que sou integralmente responsável pelo veículo durante todo o período de uso.
  `;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // ✅ VALIDAÇÃO DO TERMO
    if (!aceitouTermo) {
      setError('Você deve aceitar o termo de responsabilidade para continuar.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    if (!startDate || !endDate || !purpose) {
      setError('Por favor, preencha a data/hora de início, fim e a finalidade.');
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
    } catch (err) {
      const errorMessage = err instanceof Error
          ? err.message 
          : "Ocorreu um erro desconhecido ao agendar. Tente novamente.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função corrigida para retornar 'null' e remover o sublinhado do TypeScript
  const getDayClassName = (date: Date) => {
    const isBooked = bookedDates.some(bookedDate => isSameDay(date, bookedDate));
    return isBooked ? 'booked-day' : null;
  };

  if (!isOpen || !vehicle) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Agendar Veículo: {vehicle.name}</h2>
        </div>
        
        <form className="modal-body" onSubmit={handleSubmit} id="schedule-form">
          <div className="schedule-picker-wrapper">
            <div className="form-group">
              <label className="form-label"><Clock size={16} /> Início do Agendamento</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                minDate={new Date()}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="dd/MM/yyyy, HH:mm"
                className="form-input"
                placeholderText="Selecione a data e hora de início"
                autoComplete='off'
                dayClassName={getDayClassName}
                excludeDates={bookedDates}
                // Adicionada a prop para usar o cabeçalho customizado
                renderCustomHeader={CustomHeader}
              />
            </div>

            <div className="form-group">
              <label className="form-label"><Clock size={16} /> Fim do Agendamento</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate || new Date()}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="dd/MM/yyyy, HH:mm"
                className="form-input"
                placeholderText="Selecione a data e hora de fim"
                autoComplete='off'
                dayClassName={getDayClassName}
                excludeDates={bookedDates}
                // Adicionada a prop para usar o cabeçalho customizado
                renderCustomHeader={CustomHeader}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label"><Users size={16} /> Finalidade da Viagem</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Ex: Reunião com cliente..." 
              value={purpose} 
              onChange={(e) => setPurpose(e.target.value)} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label"><MessageSquare size={16} /> Observações (Opcional)</label>
            <textarea 
              className="form-textarea" 
              placeholder="Informações adicionais..." 
              value={observation} 
              onChange={(e) => setObservation(e.target.value)} 
              rows={3}
            />
          </div>

          {/* ✅ SEÇÃO DO TERMO DE RESPONSABILIDADE (IGUAL AO CHECKOUT) */}
          <div className="termo-section">
            <div className="termo-header">
              <FileText size={18} />
              <span>Termo de Responsabilidade</span>
              <button 
                type="button"
                className="termo-expand-button"
                onClick={() => setTermoExpandido(!termoExpandido)}
              >
                {termoExpandido ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                {termoExpandido ? 'Ver menos' : 'Ver mais'}
              </button>
            </div>
            
            {termoExpandido && (
              <div className="termo-content">
                <pre>{termoResponsabilidade}</pre>
              </div>
            )}
            
            <label className="termo-checkbox-label">
              <input
                type="checkbox"
                checked={aceitouTermo}
                onChange={(e) => setAceitouTermo(e.target.checked)}
                className="termo-checkbox"
              />
              <span className="checkmark">
                {aceitouTermo && <Check size={14} />}
              </span>
              <span className="termo-text">
                Li e concordo com o termo de responsabilidade
              </span>
            </label>
          </div>

          {error && (
            <div className="error-box error-alert">
              <AlertTriangle size={18} style={{ marginRight: '8px', minWidth: '18px' }} />
              {error}
            </div>
          )}

          <div className="alert-box">
            <strong>Atenção:</strong> O seu agendamento será enviado para aprovação.
          </div>
        </form>
        
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </button>
          <button 
            type="submit" 
            className="btn btn-primary" 
            form="schedule-form" 
            disabled={isLoading || !startDate || !endDate || !purpose || !aceitouTermo}
          >
            {isLoading ? 'Enviando...' : 'Solicitar Agendamento'}
          </button>
        </div>
      </div>
    </div>
  );
};