import { useEffect, useState } from "react";
import { getWebSocket } from "../../services/websocket";
//@ts-ignore
import notificationSound from "../../assets/audio/notification.mp3";
import { TicketCreatedNotificationWS, TicketFinishNotificationWS, TicketMessageNotificationWS } from "../../interface/ticket";

type NotificationMessage =
  | TicketCreatedNotificationWS
  | TicketMessageNotificationWS
  | TicketFinishNotificationWS;

interface UseNotificationsProps {
  userId: number;
}

export default function useNotifications({ userId }: UseNotificationsProps) {
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [count, setCount] = useState(0);
  const [animate, setAnimate] = useState(false);
  const notifiedIdsRef = useState<Set<number>>(new Set())[0];

  useEffect(() => {
    const ws = getWebSocket();
    if (!ws) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const eventData = JSON.parse(event.data);
        const message = eventData.message;
        const notifId = message.ticket_id;

        if (!notifiedIdsRef.has(notifId)) {
          notifiedIdsRef.add(notifId);

          setNotifications((prev) => [message, ...prev]);
          setCount((prev) => prev + 1);
          setAnimate(true);

          const audio = new Audio(notificationSound);
          audio.play();

          setTimeout(() => setAnimate(false), 1000);
        }
      } catch (err) {
        console.error("Erro ao processar mensagem WS:", err);
      }
    };

    ws.addEventListener("message", handleMessage);
    return () => ws.removeEventListener("message", handleMessage);
  }, [userId]);

  const markAllAsRead = () => {
    setNotifications([]);
    setCount(0);
    notifiedIdsRef.clear();
  };

  return { notifications, count, animate, markAllAsRead };
}

// import { useEffect, useState } from "react";
// //@ts-ignore
// import notificationSound from "../../assets/audio/notification.mp3";
// import { TicketCreatedNotificationWS, TicketFinishNotificationWS, TicketMessageNotificationWS, WsNotification, WsNotificationPayload } from "../../interface/ticket";

// interface UseNotificationsProps {
//   userId: number;
//   ws: WebSocket | null; // conexão existente
// }
// type NotificationMessage =
//   | TicketCreatedNotificationWS
//   | TicketMessageNotificationWS
//   | TicketFinishNotificationWS;


// export default function useNotifications({ userId, ws }: UseNotificationsProps) {
//   const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
//   const [count, setCount] = useState(0);
//   const [animate, setAnimate] = useState(false);
//   const notifiedIdsRef = useState<Set<number>>(new Set())[0];

//   useEffect(() => {
//     if (!ws) return;

//     const handleMessage = (event: MessageEvent) => {
//       try {
//         const eventData: WsNotificationPayload = JSON.parse(event.data);
//         const message = eventData.message; // sempre tem ticket_id
//         const notifId = message.ticket_id;

//         if (!notifiedIdsRef.has(notifId)) {
//           notifiedIdsRef.add(notifId);

//           setNotifications((prev) => [message, ...prev]);
//           setCount((prev) => prev + 1);
//           setAnimate(true);

//           const audio = new Audio(notificationSound);
//           audio.play();

//           setTimeout(() => setAnimate(false), 1000);
//         }
//       } catch (err) {
//         console.error("Erro ao processar mensagem WS:", err);
//       }
//     };

//     ws.addEventListener("message", handleMessage);
//     return () => ws.removeEventListener("message", handleMessage);
//   }, [ws, userId]);

//   const markAllAsRead = () => {
//     setNotifications([]);
//     setCount(0);
//     notifiedIdsRef.clear();
//   };

//   return { notifications, count, animate, markAllAsRead };
// }

