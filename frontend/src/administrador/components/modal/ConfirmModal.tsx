import React from 'react';
import './ConfirmModal.css'
interface Props {
  user: any;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmModal = ({ user, onClose, onConfirm }: Props) => {
  return (
    <div className="modal">
      <h3> {user?.is_active ? 'Desativar' : 'Ativar' } Usuário</h3>
      <p>Tem certeza que deseja desativar {user.email}?</p>
      <div>
        <button onClick={onConfirm}>Confirmar</button>
        <button onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
};

export default ConfirmModal;
