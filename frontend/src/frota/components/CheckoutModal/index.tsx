import React, { useState } from 'react';
import './styles.css';
import { Vehicle } from '../../types';
import { checkoutVehicle } from '../../services/frota.services';
import { X, Clock, User, MessageSquare, Gauge } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  onConfirm: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, vehicle, onConfirm }) => {
  // Estados para os campos do formulário
  const [departureTime, setDepartureTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [observation, setObservation] = useState('');
  const [startMileage, setStartMileage] = useState('');
  
  // Estados para o controlo do processo de submissão
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      
      onConfirm(); // Avisa a página principal que o checkout foi bem-sucedido
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const timeSlots = [];
  for (let hour = 6; hour <= 22; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Retirar Veículo</h2>
            <p className="modal-subtitle">{vehicle.name} • {vehicle.license_plate}</p>
          </div>
          <button onClick={onClose} className="modal-close-button"><X size={24} /></button>
        </div>
        
        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label"><Clock size={16} /> Horário de Saída</label>
            <select className="form-select" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} required>
              <option value="">Selecione o horário</option>
              {timeSlots.map(time => (<option key={time} value={time}>{time}</option>))}
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
        
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'A Enviar...' : 'Solicitar Retirada'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};