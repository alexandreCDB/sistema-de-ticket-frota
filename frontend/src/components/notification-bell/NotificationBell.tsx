import React, { useState, useEffect, useRef } from "react";
import useNotifications from "./NotificationBell.service";
import { Link, useLocation } from "react-router-dom";
import { Bell, CheckCheck, Car, Ticket, ExternalLink } from "lucide-react";
import "./NotificationBell.css";
import { connectWebSocket } from "../../services/websocket";
import { useAuth } from "../AUTH/AuthContext";

const NotificationBell: React.FC = () => {
  const { user, token } = useAuth();
  const [open, setOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [latestNotification, setLatestNotification] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    // Fechar dropdown ao clicar fora
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (token) {
      connectWebSocket(token);
    }
  }, [token]);

  const { notifications, count, animate, markAsRead, markAllAsRead } =
    useNotifications({
      userId: user?.id!,
    });
  const location = useLocation();

  // ✅ ATUALIZAR TÍTULO DA ABA COM O CONTADOR
  useEffect(() => {
    const baseTitle = "Doce Brinquedo";
    if (count > 0) {
      document.title = `(${count}) ${baseTitle}`;
    } else {
      document.title = baseTitle;
    }
  }, [count, location.pathname]);

  // Detectar nova notificação para mostrar o Toast
  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[0];
      // Se for uma notificação que ainda não vimos como "latest"
      if (!latestNotification || latest.id !== latestNotification.id) {
        setLatestNotification(latest);
        setShowToast(true);
        const timer = setTimeout(() => setShowToast(false), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [notifications, latestNotification]);

  const toggleDropdown = () => {
    setOpen(!open);
    if (!open) setShowToast(false); // Esconde o toast ao abrir o menu
  };

  if (!user) return null;

  return (
    <div className="bell-container" ref={dropdownRef}>
      <button
        type="button"
        className={`bell-button ${animate ? "pulse" : ""} ${count > 0 ? "has-notifications" : ""}`}
        onClick={toggleDropdown}
        aria-label="Abrir notificações"
      >
        <Bell size={22} className="bell-icon-lucide" />
        {count > 0 && <span className="notification-badge">{count}</span>}
      </button>

      {/* ✅ TOAST PREVIEW - Aparece por 3 segundos */}
      {showToast && latestNotification && !open && (
        <div className="notification-toast" onClick={toggleDropdown}>
          <div className="toast-icon">
            {"ticket_id" in latestNotification ? <Ticket size={16} /> : <Car size={16} />}
          </div>
          <div className="toast-body">
            <span className="toast-title">Nova solicitação</span>
            <p className="toast-message">{latestNotification.message}</p>
          </div>
        </div>
      )}

      {open && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h3>Notificações</h3>
            {count > 0 && (
              <button className="mark-all-read" onClick={markAllAsRead}>
                <CheckCheck size={14} /> Marcar todas como lidas
              </button>
            )}
          </div>

          <div className="dropdown-body">
            {notifications.length === 0 ? (
              <div className="empty-notifications">
                <Bell size={32} />
                <p>Nenhuma notificação nova</p>
              </div>
            ) : (
              <ul className="notification-list">
                {notifications.map((msg, idx) => {
                  const isTicket = "ticket_id" in msg;
                  return (
                    <li key={msg.id || idx} className="notification-item">
                      <div className={`notification-avatar ${isTicket ? "type-ticket" : "type-frota"}`}>
                        {isTicket ? <Ticket size={18} /> : <Car size={18} />}
                      </div>
                      <div className="notification-content">
                        <Link
                          to={`${msg.routerLink}`}
                          className="notification-message"
                          onClick={() => {
                            markAsRead(msg.id);
                            setOpen(false);
                          }}
                        >
                          {msg.message ?? "Nova notificação recebida"}
                        </Link>
                        <span className="notification-time">
                          {isTicket ? "Ticket" : "Frota"}
                        </span>
                      </div>
                      <button
                        className="notification-action"
                        onClick={() => markAsRead(msg.id)}
                        title="Marcar como lida"
                      >
                        <ExternalLink size={14} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="dropdown-footer">
            <span className="footer-status">
              Sistema de Gestão Integrada
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
