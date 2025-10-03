import React from 'react';
//@ts-ignore
import './ConfirmModal.css'
interface Props {
  user: any;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmModal = ({ user, onClose, onConfirm }: Props) => {
  return (
    <div className="umodal-overlay">
      <div className="umodal">
        <h3> {user?.is_active ? 'Desativar' : 'Ativar'} Usuário</h3>
        <p>Tem certeza que deseja desativar {user.email}?</p>
         <div className="umodal-actions">
          <button type="submit" onClick={onConfirm}>Confirmar</button>
          <button type="button" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
