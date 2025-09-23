
import React, { useState, useEffect } from "react";
import useNotifications from "./NotificationBell.service";
import { Link } from "react-router-dom";
//@ts-ignore
import bellIcon from "../../assets/images/notificacao.png";
import "./NotificationBell.css";
import useAuthService from "../AUTH/AuthForm.service";
import { connectWebSocket } from "../../services/websocket";

const NotificationBell: React.FC = () => {
  const { user } = useAuthService();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (user) {
      connectWebSocket(user.token); // conecta/reconecta WS com token do usuário
    }
  }, [user]);

  const { notifications, count, animate, markAllAsRead } = useNotifications({
    userId: user?.id!,
  });

  const toggleDropdown = () => setOpen(!open);

  if (!user) return null;

  return (
    <div className="bell-container">
      <div className={`bell-button ${animate ? "shake" : ""}`} onClick={toggleDropdown}>
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
                <Link
                  to={`/tickets/tickets/${msg.ticket_id}`}
                  className="notification-link"
                >
                  {"message" in msg ? msg.message : (msg as any).text}
                </Link>
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
// import React, { useState } from "react";
// import useNotifications from "./NotificationBell.service";
// //@ts-ignore
// import bellIcon from "../../assets/images/notificacao.png";
// import "./NotificationBell.css";
// import useAuthService from "../AUTH/AuthForm.service";
// import { getWebSocket } from "../../services/websocket";
// import { Link } from "react-router-dom";

// import {
//   TicketCreatedNotificationWS,
//   TicketMessageNotificationWS,
//   TicketFinishNotificationWS,
// } from "./type";

// type NotificationItem =
//   | TicketCreatedNotificationWS
//   | TicketMessageNotificationWS
//   | TicketFinishNotificationWS;

// const NotificationBell: React.FC = () => {
//   const { user } = useAuthService();
//   const [open, setOpen] = useState(false);

//   const { notifications, count, animate, markAllAsRead } = useNotifications({
//     userId: user?.id,
//     ws: getWebSocket(),
//   });

//   const toggleDropdown = () => setOpen(!open);

//   if (!user) return null;

//   return (
//     <div className="bell-container">
//       <div
//         className={`bell-button ${animate ? "shake" : ""}`}
//         onClick={toggleDropdown}
//       >
//         <img src={bellIcon} alt="Notificações" className="bell-icon" />
//         {count > 0 && <span className="notification-badge">{count}</span>}
//       </div>

//       {open && (
//         <div className="dropdown">
//           <p>
//             <strong>{count}</strong> notificações:
//           </p>
//           <ul className="listmsg">
//             {notifications.map((msg, idx) => (
//               <li key={idx}>
//                 <span>🔔</span>
//                 <Link
//                   to={`/tickets/tickets/${msg.ticket_id}`}
//                   className="notification-link"
//                 >
//                   {"message" in msg ? msg.message : (msg as any).text}
//                 </Link>
//               </li>
//             ))}
//           </ul>
//           <button className="mark-read" onClick={markAllAsRead}>
//             Marcar como lidas
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default NotificationBell;
