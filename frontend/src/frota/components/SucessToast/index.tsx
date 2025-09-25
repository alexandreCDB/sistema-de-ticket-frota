import React, { useEffect } from 'react';
import './styles.css';
import { CheckCircle, X } from 'lucide-react';

interface SuccessToastProps {
  message: string;
  onClose: () => void;
}

export const SuccessToast: React.FC<SuccessToastProps> = ({ message, onClose }) => {
  // Configura um temporizador para fechar a notificação automaticamente
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // A notificação desaparece após 5 segundos

    // Limpa o temporizador se o componente for desmontado
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="toast-container">
      <div className="toast-icon">
        <CheckCircle size={24} />
      </div>
      <p className="toast-message">{message}</p>
      <button className="toast-close-button" onClick={onClose}>
        <X size={18} />
      </button>
    </div>
  );
};