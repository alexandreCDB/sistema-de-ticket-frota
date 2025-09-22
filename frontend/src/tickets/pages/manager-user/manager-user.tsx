import React, { useEffect, useState } from 'react';
import './manager-user.css';
import ConfirmModal from './modal/ConfirmModal';
import PasswordResetModal from './modal/PasswordResetModal';
import UserModal from './modal/UserModal';
import { MdPersonAdd } from 'react-icons/md';
import { useAuth } from '../../services/App.services';
import { IUser } from '../../../components/AUTH/interfaces/user';
import { fetchUsers, toggleUserActive } from './manager-user.service';

const ManagerUser = () => {
  const { user, loadingUser, userError } = useAuth();
  const [users, setUsers] = useState<IUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setShowUserModal(true);
  };

  const handleEdit = (user: IUser) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleResetPassword = (user: IUser) => {
    setSelectedUser(user);
    setShowPasswordModal(true);
  };

  const handleDeactivate = (user: IUser) => {
    setSelectedUser(user);
    setShowConfirmModal(true);
  };

  const confirmDeactivate = async () => {
    if (!selectedUser) return;
    await toggleUserActive(selectedUser.id, selectedUser.is_active);
    loadUsers();
    setShowConfirmModal(false);
  };

  if (loadingUser) return <p>Carregando usuário...</p>;
  if (userError) return <p>Erro ao carregar usuário</p>;

  return (
    <div className="user-manager-container">
      <div className="user-manager-header">
        <h2>Gerenciador de Usuários</h2>
        <button className="create-user-button" onClick={handleCreate}>
          <MdPersonAdd size={20} /> Criar Usuário
        </button>
      </div>

      {loading ? (
        <p>Carregando usuários...</p>
      ) : (
        <table className="user-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Ativo</th>
              <th>Tipo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>{u.is_active ? '✅' : '⛔'}</td>
                <td
                  className={
                    u.is_super_admin
                      ? 'role-label super-admin'
                      : u.is_admin
                      ? 'role-label admin'
                      : 'role-label comum'
                  }
                >
                  {u.is_super_admin ? 'SUPER ADMIN' : u.is_admin ? 'ADMIN' : 'COMUM'}
                </td>
                <td className="user-actions">
                  <button className="edit-button" onClick={() => handleEdit(u)}>Editar</button>
                  <button className="reset-button" onClick={() => handleResetPassword(u)}>Redefinir Senha</button>
                  <button className={`deactivate-button ${u.is_active ? 'active' : 'inactive'}`} onClick={() => handleDeactivate(u)}>
                    {u.is_active ? 'Desativar' : 'Ativar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showUserModal && (
        <UserModal user={selectedUser} onClose={() => setShowUserModal(false)} onSuccess={loadUsers} />
      )}

      {showPasswordModal && selectedUser && (
        <PasswordResetModal user={selectedUser} onClose={() => setShowPasswordModal(false)} />
      )}

      {showConfirmModal && selectedUser && (
        <ConfirmModal user={selectedUser} onClose={() => setShowConfirmModal(false)} onConfirm={confirmDeactivate} />
      )}
    </div>
  );
};

export default ManagerUser;
