import React, { useState } from 'react';
import './styles.css';
import { Vehicle } from '../../types';
import { X, Calendar, Clock, Gauge, DollarSign, Car, AlertTriangle } from 'lucide-react';

interface FuelSupplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  onConfirm: (fuelSupplyData: any) => void;
  isSubmitting: boolean;
}

export const FuelSupplyModal: React.FC<FuelSupplyModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  onConfirm,
  isSubmitting
}) => {
  const [departureDate, setDepartureDate] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [departureKm, setDepartureKm] = useState('');
  const [departureAmount, setDepartureAmount] = useState('');
  
  const [returnDate, setReturnDate] = useState('');
  const [returnTime, setReturnTime] = useState('');
  const [returnKm, setReturnKm] = useState('');
  const [returnAmount, setReturnAmount] = useState('');
  
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validações
    if (!departureDate || !departureTime || !departureKm || !departureAmount ||
        !returnDate || !returnTime || !returnKm || !returnAmount) {
      setError('Todos os campos são obrigatórios.');
      return;
    }

    const departureKmNum = parseInt(departureKm);
    const returnKmNum = parseInt(returnKm);
    const departureAmountNum = parseFloat(departureAmount);
    const returnAmountNum = parseFloat(returnAmount);

    if (returnKmNum <= departureKmNum) {
      setError('KM de retorno deve ser maior que KM de saída.');
      return;
    }

    if (departureAmountNum <= 0 || returnAmountNum <= 0) {
      setError('Os valores devem ser maiores que zero.');
      return;
    }

    const fuelSupplyData = {
      vehicle_id: vehicle!.id,
      departure_date: departureDate,
      departure_time: departureTime,
      departure_km: departureKmNum,
      departure_amount: departureAmountNum,
      return_date: returnDate,
      return_time: returnTime,
      return_km: returnKmNum,
      return_amount: returnAmountNum,
    };

    onConfirm(fuelSupplyData);
  };

  const handleClose = () => {
    setError(null);
    setDepartureDate('');
    setDepartureTime('');
    setDepartureKm('');
    setDepartureAmount('');
    setReturnDate('');
    setReturnTime('');
    setReturnKm('');
    setReturnAmount('');
    onClose();
  };

  if (!isOpen || !vehicle) return null;

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-content fuel-supply-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">
              <Car size={20} style={{ marginRight: '8px' }} />
              Lançar Abastecimento
            </h2>
            <p className="modal-subtitle">
              {vehicle.name} - {vehicle.license_plate}
            </p>
          </div>
          <button className="close-button" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="fuel-supply-sections">
            {/* Seção SAÍDA */}
            <div className="supply-section">
              <h3 className="section-title">Saída</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    <Calendar size={16} />
                    Data de Saída
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Clock size={16} />
                    Hora de Saída
                  </label>
                  <input
                    type="time"
                    className="form-input"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Gauge size={16} />
                    KM de Saída
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Quilometragem"
                    value={departureKm}
                    onChange={(e) => setDepartureKm(e.target.value)}
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <DollarSign size={16} />
                    Valor de Saída (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="0.00"
                    value={departureAmount}
                    onChange={(e) => setDepartureAmount(e.target.value)}
                    min="0.01"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Seção RETORNO */}
            <div className="supply-section">
              <h3 className="section-title">Retorno</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    <Calendar size={16} />
                    Data de Retorno
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Clock size={16} />
                    Hora de Retorno
                  </label>
                  <input
                    type="time"
                    className="form-input"
                    value={returnTime}
                    onChange={(e) => setReturnTime(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Gauge size={16} />
                    KM de Retorno
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Quilometragem"
                    value={returnKm}
                    onChange={(e) => setReturnKm(e.target.value)}
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <DollarSign size={16} />
                    Valor de Retorno (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="0.00"
                    value={returnAmount}
                    onChange={(e) => setReturnAmount(e.target.value)}
                    min="0.01"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="error-box">
              <AlertTriangle size={18} style={{ marginRight: '8px' }} />
              {error}
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Lançando...' : 'Lançar Abastecimento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};