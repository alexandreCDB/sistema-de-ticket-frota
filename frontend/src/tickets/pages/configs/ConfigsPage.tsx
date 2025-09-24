import React, { useState } from 'react';
//@ts-ignore
import './ConfigsPage.css'
//@ts-ignore
import pass from '../../../assets/images/senha.png';
//@ts-ignore
import exit from '../../../assets/images/sair.png';
import PasswordResetModal from '../manager-user/modal/PasswordResetModal';
import { useAuth } from '../../services/App.services';
//@ts-ignore
const API_URL = import.meta.env.VITE_API_URL;



const ConfigsPage = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, loadingUser, userError } = useAuth();
    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    const handleLogout = async () => {
        try {
            await fetch(`${API_URL}/auth/logout/`, {
                method: "POST",
                credentials: "include", // envia o cookie HttpOnly
            });
        } finally {
            window.location.href = "/login"; // redireciona
        }
    };


return (
    <>
        <div className="main">
            <button className="google-style-button" onClick={openModal}>
                <img src={pass} alt="image" />
                Redefinir senha
            </button>
            <button className="google-style-button" onClick={handleLogout}>
                <img src={exit} alt="image" />
                Deslogar
            </button>
        </div>

        {isOpen && <PasswordResetModal
            //@ts-ignore
            user={user!}
            onClose={() => setIsOpen(false)}
        />}
    </>
);
};

export default ConfigsPage;
