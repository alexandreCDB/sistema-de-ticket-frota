// src/frota/components/CheckoutModal/index.tsx

import React from 'react';
import './styles.css';
import { Vehicle } from '../../types';
import { X, Clock, User, MessageSquare } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  // onConfirm será adicionado depois
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, vehicle }) => {
  // Se não estiver aberto ou não houver veículo, não renderiza nada
  if (!isOpen || !vehicle) {
    return null;
  }

  // Gera as opções de horário (a cada 30 min)
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
          <button onClick={onClose} className="modal-close-button">
            <X size={24} />
          </button>
        </div>
        
        <form className="modal-body">
          <div className="form-group">
            <label className="form-label">
              <Clock size={16} /> Horário de Saída
            </label>
            <select className="form-select" required>
              <option value="">Selecione o horário</option>
              {timeSlots.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              <User size={16} /> Finalidade da Viagem
            </label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Ex: Reunião com cliente, Entrega de produtos..." 
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">
              <MessageSquare size={16} /> Observações (Opcional)
            </label>
            <textarea 
              className="form-textarea" 
              placeholder="Informações adicionais..."
              rows={3}
            />
          </div>

          <div className="alert-box">
            <strong>Atenção:</strong> Ao confirmar, o veículo ficará em seu nome até que você registre o retorno.
          </div>
        </form>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Retirar Veículo
          </button>
        </div>
      </div>
    </div>
  );
};