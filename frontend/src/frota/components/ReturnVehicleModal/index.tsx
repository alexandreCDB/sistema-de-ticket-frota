import React, { useState, FormEvent } from 'react';
import './styles.css';
import { BookingWithVehicle } from '../../types';
import { X, MapPin, Gauge } from 'lucide-react';

interface ReturnVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReturn: (bookingId: number, mileage: number, location: string) => void;
  booking: BookingWithVehicle | null;
  isSubmitting: boolean;
}

export const ReturnVehicleModal = ({
  isOpen,
  onClose,
  onConfirmReturn,
  booking,
  isSubmitting
}: ReturnVehicleModalProps) => {
  const [endMileage, setEndMileage] = useState('');
  const [parkingLocation, setParkingLocation] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!booking || !endMileage || !parkingLocation) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (booking.start_mileage && parseInt(endMileage) < booking.start_mileage) {
      setError('A quilometragem final não pode ser menor que a inicial.');
      return;
    }

    if (parseInt(endMileage) > 2000000000) {
      setError('O valor da quilometragem é muito alto. Verifique se digitou corretamente.');
      return;
    }

    onConfirmReturn(booking.id, parseInt(endMileage), parkingLocation);
  };

  if (!isOpen || !booking) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Devolver Veículo</h2>

          </div>

        </div>

        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label"><Gauge size={16} /> KM Final</label>
            <input
              type="number"
              className="form-input"
              placeholder="Quilometragem no momento da devolução"
              value={endMileage}
              onChange={(e) => setEndMileage(e.target.value)}
              required
              max={2000000000}
            />
          </div>

          <div className="form-group">
            <label className="form-label"><MapPin size={16} /> Local de Estacionamento</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: G2-15"
              value={parkingLocation}
              onChange={(e) => setParkingLocation(e.target.value)}
              required
            />
          </div>

          {error && <div className="error-box">{error}</div>}

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'A Devolver...' : 'Confirmar Devolução'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};