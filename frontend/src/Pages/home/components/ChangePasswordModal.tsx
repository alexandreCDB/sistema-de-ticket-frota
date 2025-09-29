import React, { useState } from 'react';
import { X, Eye, EyeOff, Lock } from 'lucide-react';
//@ts-ignore
import '../styles/modal.css';
import { IUser } from '../../../components/AUTH/interfaces/user';
//@ts-ignore
const API_URL = import.meta.env.VITE_API_URL;


interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: IUser
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose,user }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }

    if (newPassword.length < 6) {
      alert('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    await fetch(`${API_URL}/ticket/users/${user?.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password: newPassword })
      , credentials: 'include',
    }).then(() => {
      alert('Senha redefinida com sucesso');
      setIsLoading(false);
      onClose();
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }).catch((err) => {
      alert(err);
    });
    setIsLoading(true);    
   
  };

  return (
    <div className="epm-modal-overlay fade-in">
  <div className="epm-modal-content">
    {/* Header */}
    <div className="epm-modal-header">
      <div className="epm-modal-title-container">
        <div className="epm-modal-icon blue">
          <Lock size={16} />
        </div>
        <h3 className="epm-modal-title">Alterar Senha</h3>
      </div>
      <button onClick={onClose} className="epm-modal-close">
        <X size={20} />
      </button>
    </div>

    {/* Form */}
    <form onSubmit={handleSubmit} className="epm-modal-body">
      {/* Senha Atual */}
      {/* <div className="epm-form-group">
        <label className="epm-form-label">Senha Atual</label>
        <div className="epm-form-input-container">
          <input
            type={showCurrentPassword ? 'text' : 'password'}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="epm-form-input"
            required
          />
          <button
            type="button"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            className="epm-password-toggle"
          >
            {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div> */}

      {/* Nova Senha */}
      <div className="epm-form-group">
        <label className="epm-form-label">Nova Senha</label>
        <div className="epm-form-input-container">
          <input
            type={showNewPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="epm-form-input"
            required
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="epm-password-toggle"
          >
            {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Confirmar Senha */}
      <div className="epm-form-group">
        <label className="epm-form-label">Confirmar Nova Senha</label>
        <div className="epm-form-input-container">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="epm-form-input"
            required
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="epm-password-toggle"
          >
            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Buttons */}
      <div className="epm-form-actions">
        <button type="button" onClick={onClose} className="epm-btn epm-btn-secondary">
          Cancelar
        </button>
        <button type="submit" disabled={isLoading} className="epm-btn epm-btn-primary">
          {isLoading ? 'Alterando...' : 'Alterar Senha'}
        </button>
      </div>
    </form>
  </div>
</div>

  );
};

export default ChangePasswordModal;