import { useState } from "react";
import './TicketAttachmentModal.css';

export default function TicketAttachmentModal({ ticket }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!ticket.attachment_url) return null;

  const imageUrl = `http://192.168.13.249:8000${ticket.attachment_url}`;

  return (
    <div className="form-group" style={{ marginTop: "10px", marginBottom: "10px" }}>
      <label>Anexo do Chamado:</label>
      <button
        onClick={() => setIsOpen(true)}
        className="view-btn"
      >
        👁️ Visualizar Anexo
      </button>

      {isOpen && (
        <div className="modal-overlay2" onClick={() => setIsOpen(false)}>
          <div className="modal-content2" onClick={(e) => e.stopPropagation()}>
            <span className="close-btn" onClick={() => setIsOpen(false)}>
              &times;
            </span>

            <img src={imageUrl} alt="Anexo" className="modal-image" />

            <a href={imageUrl} download className="download-btn">
              ⬇️ Baixar Anexo
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
