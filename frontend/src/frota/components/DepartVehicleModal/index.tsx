import React, { useState, useEffect } from 'react';
import { Gauge, AlertTriangle } from 'lucide-react';

interface DepartVehicleModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: any | null;
    onConfirm: (bookingId: number, startMileage: number) => Promise<void>;
    isSubmitting: boolean;
}

export const DepartVehicleModal: React.FC<DepartVehicleModalProps> = ({ isOpen, onClose, booking, onConfirm, isSubmitting }) => {
    const [startMileage, setStartMileage] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setStartMileage('');
            setError(null);
        }
    }, [isOpen]);

    if (!isOpen || !booking) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const mileageNum = parseInt(startMileage, 10);
        if (isNaN(mileageNum) || mileageNum <= 0) {
            setError('Por favor, insira um valor válido para a KM.');
            return;
        }

        if (mileageNum > 2000000000) {
            setError('O valor da quilometragem é muito alto. Verifique se digitou corretamente.');
            return;
        }

        try {
            await onConfirm(booking.id, mileageNum);
        } catch (err: any) {
            setError(err.message || 'Erro ao registrar saída.');
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Registrar Saída: {booking.vehicle.name}</h2>
                </div>

                <form className="modal-body" onSubmit={handleSubmit} id="depart-form">
                    <div className="form-group">
                        <label className="form-label"><Gauge size={16} /> KM Inicial <span className="required-field">*</span></label>
                        <input
                            type="number"
                            className="form-input"
                            placeholder="Digite a quilometragem atual do veículo"
                            value={startMileage}
                            onChange={(e) => setStartMileage(e.target.value)}
                            required
                            min="1"
                            max={2000000000}
                        />
                    </div>

                    {error && (
                        <div className="error-box error-alert">
                            <AlertTriangle size={18} style={{ marginRight: '8px' }} />
                            {error}
                        </div>
                    )}
                </form>

                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        form="depart-form"
                        disabled={isSubmitting || !startMileage}
                        style={{ backgroundColor: '#10b981' }}
                    >
                        {isSubmitting ? 'Registrando...' : 'Confirmar Saída'}
                    </button>
                </div>
            </div>
        </div>
    );
};
