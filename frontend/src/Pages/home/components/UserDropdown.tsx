import React, { useContext, useState } from 'react';
import { User, Lock, LogOut } from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';
import EditProfileModal from './EditProfileModal';
//@ts-ignore
import './../styles/dropdown.css';
import PasswordResetModal from '../../../tickets/pages/manager-user/modal/PasswordResetModal';
import { useAuth } from '../../../components/AUTH/AuthContext';
// import { useAuth } from '../../../tickets/services/App.services';
//@ts-ignore
const API_URL = import.meta.env.VITE_API_URL;


interface UserDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ isOpen, onClose, userName, userEmail }) => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { user, loadingUser, userError } = useAuth();
  if (!isOpen) return null;


  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include", // envia o cookie HttpOnly
      });
    } finally {
      window.location.href = "/login"; // redireciona
    }
    onClose();
  };

  const handleChangePassword = () => {
    setShowPasswordModal(true);
    // onClose();
  };

  const handleEditProfile = () => {
    setShowProfileModal(true);
    // onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div className="dropdown-overlay" onClick={onClose}></div>

      {/* Dropdown */}
      <div className="dropdown-menu slide-down">
        {/* Header do Dropdown */}
        <div className="dropdown-header">
          <div className="dropdown-user-info">
            <div className="dropdown-avatar">
              <User size={20} />
            </div>
            <div className="dropdown-user-details">
              <p className="dropdown-user-name">{userName}</p>
              <p className="dropdown-user-email">{userEmail}</p>
            </div>
          </div>
        </div>

        {/* Opções do Menu */}
        <div className="dropdown-options">
          <button onClick={handleEditProfile} className="dropdown-item">
            <User size={16} />
            <span>Editar Perfil</span>
          </button>

          <button onClick={handleChangePassword} className="dropdown-item">
            <Lock size={16} />
            <span>Alterar Senha</span>
          </button>

          <div className="dropdown-divider"></div>

          <button onClick={handleLogout} className="dropdown-item logout">
            <LogOut size={16} />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      {/* {showPasswordModal && <PasswordResetModal
        //@ts-ignore
        user={user!}
        onClose={() => setShowPasswordModal(false)}
      />} */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        user={user!}
      />
      <EditProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        currentName={userName}
        currentEmail={userEmail}
      />
    </>
  );
};

export default UserDropdown;