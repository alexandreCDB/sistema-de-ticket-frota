import React from "react";
import { useNavigate } from "react-router-dom";
//@ts-ignore
import "./TicketDeprecatedPage.css";

const TicketDeprecatedPage: React.FC = () => {
  const navigate = useNavigate();

  const handleRedirect = () => {
    const email = sessionStorage.getItem("authEmail");
    const password = sessionStorage.getItem("authPassword");

    if (!email || !password) {
      alert("Credenciais não encontradas na sessão.");
      return;
    }

    const url = `http://192.168.13.249/auth/login?l=${encodeURIComponent(email)}&s=${encodeURIComponent(password)}`;

    window.location.href = url;
  };

  return (
  <div className="deprecated-container">
    <div className="card">
      <h1>⚠ Aviso Importante</h1>

      <p>
        Logo mais essa página de Ticket vai ser removida desse caminho.
      </p>

      <p className="favorite-warning">
        👉 Recomendamos que você salve o <strong>Novo Portal</strong> nos seus
        favoritos para acessar com mais facilidade.
      </p>

      <div className="button-group">
        <button className="btn secondary" onClick={() => navigate("/")}>
          Voltar
        </button>

        <button className="btn primary" onClick={handleRedirect}>
          Novo Portal
        </button>
      </div>
    </div>
  </div>
);

};

export default TicketDeprecatedPage;
