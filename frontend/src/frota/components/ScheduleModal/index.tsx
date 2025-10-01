import React, { useState, FormEvent, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { setHours, setMinutes } from 'date-fns';
//@ts-ignore
import 'react-datepicker/dist/react-datepicker.css';
//@ts-ignore
import './styles.css';
import { Vehicle } from '../../types';
import { X, Clock, MessageSquare, Users } from 'lucide-react'; // Ícone trocado para Clock
import { createSchedule } from '../../services/frota.services';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  onConfirm: () => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({ isOpen, onClose, vehicle, onConfirm }) => {
  // O QUE MUDOU: Os estados continuam os mesmos, mas agora vão guardar data E hora
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [purpose, setPurpose] = useState('');
  const [observation, setObservation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // O QUE MUDOU: Lógica de resetar o estado ao abrir o modal
  useEffect(() => {
    if (isOpen) {
      setStartDate(null);
      setEndDate(null);
      setPurpose('');
      setObservation('');
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
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
    } catch (err: any) {
      const detail = err.response?.data?.detail || "Ocorreu um erro ao agendar. Tente novamente.";
      setError(detail);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !vehicle) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Agendar Veículo: {vehicle.name}</h2>
        </div>
        
        <form className="modal-body" onSubmit={handleSubmit} id="schedule-form">
          
          {/* O QUE MUDOU: Dois seletores de data/hora em vez de um calendário */}
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
                minDate={startDate || new Date()} // O fim não pode ser antes do início
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="dd/MM/yyyy, HH:mm"
                className="form-input"
                placeholderText="Selecione a data e hora de fim"
                autoComplete='off'
              />
            </div>
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
            <strong>Atenção:</strong> O seu agendamento será enviado para aprovação. O sistema irá verificar a disponibilidade do horário.
          </div>
        </form>
        
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" form="schedule-form" disabled={isLoading || !startDate || !endDate || !purpose}>
            {isLoading ? 'Enviando...' : 'Solicitar Agendamento'}
          </button>
        </div>
      </div>
    </div>
  );
};