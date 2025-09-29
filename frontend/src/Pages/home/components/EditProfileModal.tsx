import React, { useState } from 'react';
import { X, User } from 'lucide-react';
//@ts-ignore
import '../styles/modal.css';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  currentEmail: string;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentName,
  currentEmail
}) => {
  const [name, setName] = useState(currentName);
  const [email, setEmail] = useState(currentEmail);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    setTimeout(() => {
      alert('Em desenvolvimento: funcionalidade de atualização de perfil não implementada.');
      console.log('Perfil atualizado:', { name, email });
      setIsLoading(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="epm-modal-overlay fade-in">
      <div className="epm-modal-content">
        {/* Header */}
        <div className="epm-modal-header">
          <div className="epm-modal-title-container">
            <div className="epm-modal-icon green">
              <User size={16} />
            </div>
            <h3 className="epm-modal-title">Editar Perfil</h3>
          </div>
          <button onClick={onClose} className="epm-modal-close">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="epm-modal-body">
          {/* Nome */}
          <div className="epm-form-group">
            <label className="epm-form-label">Nome Completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="epm-form-input"
              required
            />
          </div>

          {/* Email */}
          <div className="epm-form-group">
            <label className="epm-form-label">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="epm-form-input"
              required
            />
          </div>

          {/* Buttons */}
          <div className="epm-form-actions">
            <button type="button" onClick={onClose} className="epm-btn epm-btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={isLoading} className="epm-btn epm-btn-success">
              {isLoading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>

  );
};

export default EditProfileModal;