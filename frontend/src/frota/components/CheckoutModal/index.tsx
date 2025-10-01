import React, { useState, useEffect, useMemo } from 'react';
import './styles.css';
import { Vehicle } from '../../types';
import { checkoutVehicle } from '../../services/frota.services';
import { Clock, User, MessageSquare, Gauge } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  onConfirm: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, vehicle, onConfirm }) => {
  const [departureTime, setDepartureTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [observation, setObservation] = useState('');
  const [startMileage, setStartMileage] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // O QUE MUDOU: A lógica agora FILTRA os horários em vez de desabilitá-los
  const timeSlots = useMemo(() => {
    const slots = [];
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    for (let hour = 6; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 5) {
        const isPast = hour < currentHour || (hour === currentHour && minute < currentMinute);
        
        // Adiciona o horário na lista APENAS se ele NÃO tiver passado
        if (!isPast) {
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          slots.push(time);
        }
      }
    }
    return slots;
  }, []);

  useEffect(() => {
    if (isOpen) {
      // O QUE MUDOU: A lógica aqui ficou mais simples.
      // Como a lista SÓ tem horários válidos, o primeiro item (índice 0) é o que queremos.
      if (timeSlots.length > 0) {
        setDepartureTime(timeSlots[0]);
      } else {
        // Caso não haja mais horários disponíveis no dia
        setDepartureTime('');
      }
      
      // Reseta outros campos ao abrir
      setPurpose('');
      setObservation('');
      setStartMileage('');
      setError(null);
    }
  }, [isOpen, timeSlots]);

  if (!isOpen || !vehicle) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await checkoutVehicle({
        vehicle_id: vehicle.id,
        purpose: purpose || null,
        observation: observation || null,
        start_mileage: startMileage ? parseInt(startMileage, 10) : null
      });
      
      onConfirm();
    } catch (err: any) {
      const detail = err.response?.data?.detail || "Ocorreu um erro. Tente novamente.";
      setError(detail);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Retirar Veículo: {vehicle.name}</h2>
        </div>
        
        <form className="modal-body" onSubmit={handleSubmit} id="checkout-form">
          <div className="form-group">
            <label className="form-label"><Clock size={16} /> Horário de Saída</label>
            <select className="form-select" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} required>
              {/* O QUE MUDOU: Renderização mais simples, sem 'disabled' */}
              {timeSlots.length > 0 ? (
                timeSlots.map(time => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))
              ) : (
                <option value="" disabled>Não há horários disponíveis hoje</option>
              )}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label"><User size={16} /> Finalidade da Viagem</label>
            <input type="text" className="form-input" placeholder="Ex: Reunião com cliente..." value={purpose} onChange={(e) => setPurpose(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label"><Gauge size={16} /> KM Inicial (Opcional)</label>
            <input 
              type="number" 
              className="form-input" 
              placeholder="Apenas números" 
              value={startMileage} 
              onChange={(e) => setStartMileage(e.target.value)} 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label"><MessageSquare size={16} /> Observações (Opcional)</label>
            <textarea className="form-textarea" placeholder="Informações adicionais..." value={observation} onChange={(e) => setObservation(e.target.value)} rows={3}/>
          </div>

          {error && <div className="error-box">{error}</div>}

          <div className="alert-box">
            <strong>Atenção:</strong> A sua solicitação será enviada para aprovação.
          </div>
        </form>
        
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" form="checkout-form" disabled={isLoading || !departureTime || !purpose}>
            {isLoading ? 'Enviando...' : 'Solicitar Retirada'}
          </button>
        </div>
      </div>
    </div>
  );
};