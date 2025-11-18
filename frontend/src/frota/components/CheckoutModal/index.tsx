import React, { useState, useEffect, useMemo } from 'react';
import './styles.css';
import { Vehicle } from '../../types';
import { checkoutVehicle } from '../../services/frota.services';
import { Clock, User, MessageSquare, Gauge, AlertTriangle, Check, ChevronDown, ChevronUp, FileText } from 'lucide-react';

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
  
  // ✅ NOVOS ESTADOS PARA O TERMO
  const [aceitouTermo, setAceitouTermo] = useState(false);
  const [termoExpandido, setTermoExpandido] = useState(false);

  const timeSlots = useMemo(() => {
    const slots = [];
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    for (let hour = 6; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 5) {
        const isPast = hour < currentHour || (hour === currentHour && minute < currentMinute);
        
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
      if (timeSlots.length > 0) {
        setDepartureTime(timeSlots[0]);
      } else {
        setDepartureTime('');
      }
      
      setPurpose('');
      setObservation('');
      setStartMileage('');
      setError(null);
      setAceitouTermo(false);
      setTermoExpandido(false);
    }
  }, [isOpen, timeSlots]);

  // ✅ TERMO DE RESPONSABILIDADE
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ VALIDAÇÃO DA KM (AGORA OBRIGATÓRIA)
    if (!startMileage.trim()) {
      setError('O campo KM Inicial é obrigatório.');
      return;
    }

    // ✅ VALIDAÇÃO SE É UM NÚMERO VÁLIDO
    const mileageNumber = parseInt(startMileage, 10);
    if (isNaN(mileageNumber) || mileageNumber <= 0) {
      setError('Por favor, insira um valor válido para a KM.');
      return;
    }

    // ✅ VALIDAÇÃO DO TERMO
    if (!aceitouTermo) {
      setError('Você deve aceitar o termo de responsabilidade para continuar.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await checkoutVehicle({
        vehicle_id: vehicle!.id,
        purpose: purpose || null,
        observation: observation || null,
        start_mileage: mileageNumber // ✅ AGORA SEMPRE ENVIADO
      });
      
      onConfirm();
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message 
        : "Ocorreu um erro desconhecido. Tente novamente.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !vehicle) return null;

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
            <label className="form-label"><Gauge size={16} /> KM Inicial <span className="required-field">*</span></label>
            <input 
              type="number" 
              className="form-input" 
              placeholder="Digite a quilometragem atual" 
              value={startMileage} 
              onChange={(e) => setStartMileage(e.target.value)} 
              required
              min="1"
            />
            <div className="field-hint">Campo obrigatório</div>
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

          {/* ✅ SEÇÃO DO TERMO DE RESPONSABILIDADE */}
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
            <strong>Atenção:</strong> A sua solicitação será enviada para aprovação.
          </div>
        </form>
        
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </button>
          <button 
            type="submit" 
            className="btn btn-primary" 
            form="checkout-form" 
            disabled={isLoading || !departureTime || !purpose || !startMileage || !aceitouTermo}
          >
            {isLoading ? 'Enviando...' : 'Solicitar Retirada'}
          </button>
        </div>
      </div>
    </div>
  );
};