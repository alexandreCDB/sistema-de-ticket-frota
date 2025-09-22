import React, { useEffect, useRef, useState } from "react";
import "./NotificationBell.css";
import { NotificationItem } from "./type";
//@ts-ignore
import bellIcon from "../../../assets/images/notificacao.png";
//@ts-ignore
import notificationSound from "../../../assets/audio/notification.mp3";
import { fetchNotifications, markAllAsRead, markAsRead } from "./NotificationBell.service";

const NotificationBell = ({ userId }: { userId: number }) => {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [animate, setAnimate] = useState(false);

  const notifiedIdsRef = useRef<Set<number>>(new Set());
  const LOCAL_STORAGE_KEY = "notifiedNotificationIds";

  const getNotifiedIds = (): Set<number> => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) return new Set();
    try {
      return new Set(JSON.parse(stored));
    } catch {
      return new Set();
    }
  };

  const saveNotifiedIds = (ids: Set<number>) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(Array.from(ids)));
  };

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    let blinkInterval: ReturnType<typeof setInterval> | null = null;
    if (count > 0) {
      let toggle = false;
      blinkInterval = setInterval(() => {
        document.title = toggle
          ? `(${count}) Nova${count > 1 ? "s" : ""} notificação${count > 1 ? "es" : ""}`
          : "🔔 Você tem novas notificações!";
        toggle = !toggle;
      }, 1000);
    } else {
      document.title = "Tickets Doce Brinquedo";
    }
    return () => {
      if (blinkInterval) clearInterval(blinkInterval);
    };
  }, [count]);

  const toggleDropdown = () => setOpen(!open);

  const loadNotifications = async () => {
    try {
      const data = await fetchNotifications(userId);
      const notifiedIds = getNotifiedIds();

      const newNotifications = data.filter((notif) => !notifiedIds.has(notif.id));

      if (newNotifications.length > 0) {
        setAnimate(true);
        const audio = new Audio(notificationSound);
        audio.play();

        newNotifications.forEach((notif) => notifiedIds.add(notif.id));
        saveNotifiedIds(notifiedIds);

        setTimeout(() => setAnimate(false), 1000);
      }

      setNotifications(data);
      setCount(data.length);
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead(notifications);
      setCount(0);
      setNotifications([]);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  if (count <= 0) return null;

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
            {notifications.map((msg) => (
              <li key={msg.id}>
                <span>🔔</span>
                <a
                  href={`/dashboard/tickets/${msg.ticket_id}`}
                  className="notification-link"
                  onClick={async (e) => {
                    e.preventDefault();
                    await markAsRead(msg.id);
                    setOpen(false);
                    window.location.href = `/dashboard/tickets/${msg.ticket_id}`;
                  }}
                >
                  {msg.message}
                </a>
              </li>
            ))}
          </ul>
          <button className="mark-read" onClick={handleMarkAllAsRead}>
            Marcar como lidas
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;


// import React, { useEffect, useRef, useState } from 'react';
// import './NotificationBell.css';
// import { NotificationItem } from './type';
// import { MdNotifications } from 'react-icons/md';
// //@ts-ignore
// import bellIcon from '../../../assets/images/notificacao.png';
// //@ts-ignore
// import notificationSound from '../../../assets/audio/notification.mp3';



// const NotificationBell = ({ userId }: { userId: number }) => {
//   const [count, setCount] = useState(0);
//   const [open, setOpen] = useState(false);
//   const [notifications, setNotifications] = useState<NotificationItem[]>([]);
//   const [animate, setAnimate] = useState(false);
  


//   const notifiedIdsRef = useRef<Set<number>>(new Set());
//   const LOCAL_STORAGE_KEY = 'notifiedNotificationIds';

//   const getNotifiedIds = (): Set<number> => {
//     const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
//     if (!stored) return new Set();
//     try {
//       const parsed = JSON.parse(stored);
//       return new Set(parsed);
//     } catch {
//       return new Set();
//     }
//   };

// const saveNotifiedIds = (ids: Set<number>) => {
//   localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(Array.from(ids)));
// };
  
//   useEffect(() => {
//   if ("Notification" in window && Notification.permission !== "granted") {
//     Notification.requestPermission();
//   }
// }, []);
// useEffect(() => {
//   let blinkInterval: ReturnType<typeof setInterval> | null = null;


//   if (count > 0) {
//     let toggle = false;
//     blinkInterval = setInterval(() => {
//       document.title = toggle
//         ? `(${count}) Nova${count > 1 ? 's' : ''} notificação${count > 1 ? 'es' : ''}`
//         : '🔔 Você tem novas notificações!';
//       toggle = !toggle;
//     }, 1000); // troca a cada 1 segundo
//   } else {
//     document.title = 'Tickets Doce Brinquedo'; // título padrão
//   }

//   return () => {
//     if (blinkInterval) {
//       clearInterval(blinkInterval);
//     }
//   };
// }, [count]);

//   const toggleDropdown = () => setOpen(!open);

//   const fetchNotifications = async () => {
//     try {
//       const response = await fetch(`/api/ticket/notifications/unread/${userId}`);
//       const data: NotificationItem[] = await response.json();


//       const notifiedIds = getNotifiedIds();

//       const newNotifications = data.filter(
//         (notif) => !notifiedIds.has(notif.id)
//       );

//       if (newNotifications.length > 0) {
//         setAnimate(true);
//         const audio = new Audio(notificationSound);
//         audio.play();

//         newNotifications.forEach((notif) => notifiedIds.add(notif.id));
//         saveNotifiedIds(notifiedIds);

//         setTimeout(() => setAnimate(false), 1000);
//       }


//       // Apenas se houver novas notificações
//       // if (data.length > count) {
//       //   setAnimate(true);
//       //   // Futuramente: som
//       //   const audio = new Audio(notificationSound); 
//       //   // audio.play();
//       //   setTimeout(() => setAnimate(false), 1000); // dura a animação
//       // }

//       setNotifications(data);
//       setCount(data.length);
//     } catch (error) {
//       console.error("Erro ao buscar notificações:", error);
//     }
//   };

//   const markAsRead = async (notificationId: number) => {
//     try {
//       await fetch(`/api/tickets/notifications/read/${notificationId}`, {
//         method: 'PATCH'
//       });
//     } catch (error) {
//       console.error("Erro ao marcar notificação como lida:", error);
//     }
//   };
// const markAllAsRead = async () => {
//   try {
//     await Promise.all(
//       notifications.map((msg) =>
//         fetch(`/api/notifications/read/${msg.id}`, {
//           method: 'PATCH',
//         })
//       )
//     );

//     // Atualiza o estado local
//     setCount(0);
//     setNotifications([]);
//   } catch (error) {
//     console.error("Erro ao marcar todas como lidas:", error);
//   }
// };

//   useEffect(() => {
//     fetchNotifications();
//     const interval = setInterval(fetchNotifications, 5000);
//     return () => clearInterval(interval);
//   }, [userId]);



//   if (count <= 0 ) {
//     return
//   }

//   return (
//     <div className="bell-container">
//       <div
//         className={`bell-button ${animate ? 'shake' : ''}`}
//         onClick={toggleDropdown}
//       >
//         <img src={bellIcon} alt="Notificações" className="bell-icon" />
//         {count > 0 && (
//           <span className="notification-badge">{count}</span>
//         )}
//       </div>

//       {open && (
//         <div className="dropdown">
//           <p><strong>{count}</strong> notificações:</p>
//           <ul className="listmsg">
//             {notifications.map((msg, index) => (
//               <li key={index}>
//                 <span>🔔</span>
//                 <a
//                   href={`/dashboard/tickets/${msg.ticket_id}`}
//                   className="notification-link"
//                   onClick={async (e) => {
//                     e.preventDefault();
//                     await markAsRead(msg.id);
//                     setOpen(false);
//                     window.location.href = `/dashboard/tickets/${msg.ticket_id}`;
//                   }}
//                 >
//                   {msg.message}
//                 </a>
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
