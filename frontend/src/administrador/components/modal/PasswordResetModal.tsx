import React, { useState } from 'react';
//@ts-ignore
import './PasswordResetModal.css'
import { IUser } from '../../../components/AUTH/interfaces/user';
//@ts-ignore
const API_URL = import.meta.env.VITE_API_URL;

interface Props {
  user: IUser;
  onClose: () => void;
}

const PasswordResetModal = ({ user, onClose }: Props) => {
  const token = localStorage.getItem('access_token');
  const [newPassword, setNewPassword] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    await fetch(`${API_URL}/ticket/users/${user?.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password: newPassword })
      , credentials: 'include',
    }).then(() => {
      alert('Senha redefinida com sucesso');
      onClose();
    }).catch((err) => {
      alert(err);
    });


  };

  return (
    <div className="pmodal">
      <h3>Redefinir senha de {user.email}</h3>
      <form onSubmit={handleReset}>
        <label>Nova senha:</label>
        <input
          type="password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required
        />

        <div>
          <button type="submit">Redefinir</button>
          <button type="button" onClick={onClose}>Cancelar</button>
        </div>
      </form>
    </div>
  );
};

export default PasswordResetModal;
