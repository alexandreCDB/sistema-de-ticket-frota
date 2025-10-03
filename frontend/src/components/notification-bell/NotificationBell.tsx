import React, { useState, useEffect } from "react";
import useNotifications, { NotificationItemFrota, NotificationItemTicket } from "./NotificationBell.service";
import { Link } from "react-router-dom";
//@ts-ignore
import bellIcon from "../../assets/images/notificacao.png";
//@ts-ignore
import "./NotificationBell.css";
import { connectWebSocket } from "../../services/websocket";
import { useAuth } from "../AUTH/AuthContext";


const NotificationBell: React.FC = () => {
  const { user } = useAuth();
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

  useEffect(() => {
    let blinkInterval: ReturnType<typeof setInterval> | null = null;
    if (count > 0) {
      let toggle = false;
      blinkInterval = setInterval(() => {
        document.title = toggle
          ? `(${count}) Nova${count > 1 ? "s" : ""} notificação${count > 1 ? "es" : ""}`
          : "🔔 Você tem novas notificações!";
        toggle = !toggle;
      }, 10);
    } else {
      document.title = "Tickets Doce Brinquedo";
    }
    return () => {
      if (blinkInterval) clearInterval(blinkInterval);
    };
  }, [count]);
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


                {msg.ticket_id ? (
                  <span style={{ fontSize: "25px" }}>🔖</span> // Ticket
                ) : (
                  <span style={{ fontSize: "25px" }}>🚗</span> // Frota
                )}
                {/* <span style={{background:"black"}}>{msg.icon}</span> */}


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
