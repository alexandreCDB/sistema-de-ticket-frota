import React, { useState, useEffect } from "react";
import useNotifications from "./NotificationBell.service";
import { Link } from "react-router-dom";
//@ts-ignore
import bellIcon from "../../assets/images/notificacao.png";
//@ts-ignore
import "./NotificationBell.css";
import useAuthService from "../AUTH/AuthForm.service";
import { connectWebSocket } from "../../services/websocket";

const NotificationBell: React.FC = () => {
  const { user } = useAuthService();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);
  useEffect(() => {
    if (user) {
      connectWebSocket(user.token); // conecta/reconecta WS com token do usuário
    }
  }, [user]);

  // agora vem os dois do hook
  const { notifications, count, animate, markAsRead, markAllAsRead } =
    useNotifications({
      userId: user?.id!,
    });

  const toggleDropdown = () => setOpen(!open);

  if (!user || count === 0) return null;

  return (
    <div className="bell-container">
      <div
        className={`bell-button ${animate ? "shake" : ""}`}
        onClick={toggleDropdown}
      >
        <img src={bellIcon} alt="Notificações" className="bell-icon" />
        {count > 0 && <span className="notification-badge">{count}</span>}
      </div>

      {open && (
        <div className="dropdown">
          <p>
            <strong>{count}</strong> notificações:
          </p>
          <ul className="listmsg">


            {notifications.map((msg, idx) => (
              <li key={idx}>
                <span>🔔</span>
                {"ticket_id" in msg ? (
                  <Link
                    to={`${msg.routerLink}`}
                    className="notification-link"
                    onClick={() => markAsRead(msg.id)}
                  >
                    {msg.message ?? "Mensagem indisponível"}
                  </Link>
                ) : (
                  <Link
                    to={`${msg.routerLink}`}
                    className="notification-link"
                    onClick={() => markAsRead(msg.id)}
                  >
                    {msg.message ?? "Mensagem indisponível"}
                  </Link>
                )}
                {/* <Link
                  to={`/tickets/tickets/${msg.ticket_id}`}
                  className="notification-link"
                  onClick={() => markAsRead(msg.id)} // agora usa o hook
                >

                  {msg.message  ?? "Mensagem indisponível"}

                </Link> */}
              </li>
            ))}





          </ul>
          <button className="mark-read" onClick={markAllAsRead}>
            Marcar como lidas
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
