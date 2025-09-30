import React, { useState, useEffect } from 'react';
//@ts-ignore
import './UserModal.css'


interface Props {
  user: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

const UserModal = ({ user, onClose, onSuccess }: Props) => {
  const token = localStorage.getItem('access_token');
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [role, setRole] = useState(
    user?.is_super_admin ? 'is_super_admin' :
      user?.is_admin ? 'is_admin' :
        ''
  );
  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setIsAdmin(user.is_admin);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      email,
      is_admin: role === 'is_admin' || role === 'is_super_admin',
      is_super_admin: role === 'is_super_admin',
    };

    if (user) {
      await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json','Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
    }
    else {
      if (!user && password !== confirmPassword) {
        alert('As senhas não coincidem!');
        return;
      }

      if (!user) {
        payload.password = password;
      }
      try {
        await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ ...payload }),
        });
      } catch (error) {
        return
      }
    }





    onSuccess();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{user ? 'Editar Usuário' : 'Criar Usuário'}</h3>
        <form onSubmit={handleSubmit}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          {!user && (
            <>
              <label>Senha:</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />

              <label>Confirmar Senha:</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </>
          )}

          <label>Tipo de usuário:</label>
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="">Comum</option>
            <option value="is_admin">Admin</option>
            <option value="is_super_admin">Super Admin</option>
          </select>

          <div className="modal-actions">
            <button type="submit">Salvar</button>
            <button type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );

};

export default UserModal;
