// Hook: useNotifications.ts
import { JSX, useEffect, useState } from "react";
import { getWebSocket } from "../../services/websocket";
//@ts-ignore
import notificationSoundTicket from "../../assets/audio/notification.mp3";;
//@ts-ignore
import notificationSoundCar from "../../assets/audio/car.mp3";;
import {
  WsNotification,
  TicketCreatedNotificationWS,
  TicketMessageNotificationWS,
  TicketFinishNotificationWS,
} from "../../interface/ticket";
//@ts-ignore
const API_URL = import.meta.env.VITE_API_URL as string;
import { Ticket, Car, CheckCircle } from "lucide-react";

export interface NotificationItemTicket {
  id: number;
  ticket_id: number;
  message: string;   // 🔔 sempre presente aqui
  read?: boolean;
  routerLink: string; // opcional, para links customizados
  icon: JSX.Element
}
export interface NotificationItemFrota {
  id: number;
  vehicle_id: number;
  message: string;   // 🔔 sempre presente aqui
  read?: boolean;
  routerLink: string; // opcional, para links customizados
  icon: JSX.Element
}

interface UseNotificationsProps {
  userId: number;
}

// ------------------ REST helpers ------------------
export async function markAsReadRemote(notificationId: number): Promise<void> {
  const response = await fetch(`${API_URL}/ticket/notifications/read/${notificationId}`, {
    method: "PATCH",
  });
  if (!response.ok) throw new Error("Erro ao marcar notificação como lida");
}

export async function markAllAsReadRemote(notifications: NotificationItemTicket[] | NotificationItemFrota[]): Promise<void> {
  await Promise.all(
    //@ts-ignore
    notifications.map((msg) =>
      fetch(`${API_URL}/ticket/notifications/read/${msg.id}`, {
        method: "PATCH",
      })
    )
  );
}

export async function fetchNotifications(userId: number): Promise<NotificationItemTicket[] | NotificationItemFrota[]> {
  const response = await fetch(`${API_URL}/ticket/notifications/unread/${userId}`);
  if (!response.ok) throw new Error("Erro ao buscar notificações");
  return response.json();
}

// ------------------ Hook ------------------
export default function useNotifications({ userId }: UseNotificationsProps) {
  const [notifications, setNotifications] = useState<NotificationItemTicket[] | NotificationItemFrota[]>([]);
  const [count, setCount] = useState(0);
  const [animate, setAnimate] = useState(false);
  const notifiedIdsRef = useState<Set<number>>(new Set())[0];

  useEffect(() => {
    if (!userId) return;

    (async () => {
      try {
        const unread = await fetchNotifications(userId);
        const normalizedUnread = unread
          .map((n: any) => normalizeNotification(n))
          .filter(Boolean) as (NotificationItemTicket | NotificationItemFrota)[];
         console.log();
         //@ts-ignore
        setNotifications(normalizedUnread);
        setCount(normalizedUnread.length);

        normalizedUnread.forEach((n) => notifiedIdsRef.add(n.id));
        // const unread = await fetchNotifications(userId);

        // setNotifications(unread);
        // setCount(unread.length);

        // unread.forEach((n) => notifiedIdsRef.add(n.id));
      } catch (err) {
        console.error("Erro ao carregar notificações iniciais:", err);
      }
    })();
  }, [userId]);

  useEffect(() => {
    const ws = getWebSocket();
    if (!ws) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data: WsNotification<any> = JSON.parse(event.data);

        let normalized: NotificationItemTicket | NotificationItemFrota | null = null;
        let song = notificationSoundTicket;
        switch (data.type) {
          case "ticket_created":
            normalized = {
              id: data.message.id,
              ticket_id: data.message.ticket_id,
              message: data.message.message,
              routerLink: `/tickets/tickets/${data.message.ticket_id}`,
              icon: <Ticket size={18} className="inline-block text-blue-500" />

            };
            song = notificationSoundTicket;
            break;

          case "ticket_message":
            normalized = {
              id: data.message.id,
              ticket_id: data.message.ticket_id,
              message: data.message.message,
              routerLink: `/tickets/tickets/${data.message.ticket_id}`,
              icon: <Ticket size={18} className="inline-block text-blue-500" />
            };
            song = notificationSoundTicket;
            break;

          case "ticket_finish":
            normalized = {
              id: data.message.id,
              ticket_id: data.message.ticket_id,
              message: `Ticket encerrado: ${data.message.ticket_id}`,
              routerLink: `/tickets/tickets/${data.message.ticket_id}`,
              icon: <Ticket size={18} className="inline-block text-blue-500" />
            };
            song = notificationSoundTicket;
            break;

          case "frota_checkout":
            normalized = {
              id: data.message.id,
              vehicle_id: data.message.ticket_id,
              message: data.message.message,
              routerLink: `/frotas/admin`,
              icon: <Car size={18} className="inline-block text-blue-500" />
            };
            song = notificationSoundCar;
            break;
          case "frota_return":
            normalized = {
              id: data.message.id,
              vehicle_id: data.message.vehicle_id,
              message: data.message.message,
              routerLink: `/frotas`,
              icon: <Car size={18} className="inline-block text-blue-500" />
            };
            song = notificationSoundCar;
            break;

          case "frota_solicitation":
            normalized = {
              id: data.message.id,
              vehicle_id: data.message.vehicle_id,
              message: data.message.message,
              routerLink: `/frotas/meus-veiculos`,
              icon: <Car size={18} className="inline-block text-blue-500" />
            };
            song = notificationSoundCar;
            break;

          default:
            return; // ignora outros
        }

        if (!normalized) return;

        //@ts-ignore
        setNotifications((prev) => [normalized!, ...prev]);
        setCount((prev) => prev + 1);
        setAnimate(true);

        setTimeout(() => setAnimate(false), 1000);

        if (!notifiedIdsRef.has(normalized.id)) {
          notifiedIdsRef.add(normalized.id);
          new Audio(song).play();
          showBrowserNotification("Nova Notificação 🚨", {
            body: normalized.message,
            icon: "/favicon.ico", // pode ser seu ícone custom
            data: { url: normalized.routerLink }, // link para abrir
          });
        }
      } catch (err) {
        console.error("Erro ao processar mensagem WS:", err);
      }
    };

    ws.addEventListener("message", handleMessage);
    return () => ws.removeEventListener("message", handleMessage);
  }, [userId]);


  function normalizeNotification(data: any): NotificationItemTicket | NotificationItemFrota | null {
    let normalized: NotificationItemTicket | NotificationItemFrota | null = null;

    switch (data.notification_type) {
          case "ticket_created":
            normalized = {
              id: data.id,
              ticket_id: data.ticket_id,
              message: data.message,
              routerLink: `/tickets/tickets/${data.ticket_id}`,
              icon: <Ticket size={18} className="inline-block text-blue-500" />

            };
            break;

          case "ticket_message":
            normalized = {
              id: data.id,
              ticket_id: data.ticket_id,
              message: data.message,
              routerLink: `/tickets/tickets/${data.ticket_id}`,
              icon: <Ticket size={18} className="inline-block text-blue-500" />
            };
            break;

          case "ticket_finish":
            normalized = {
              id: data.id,
              ticket_id: data.ticket_id,
              message: `Ticket encerrado: ${data.ticket_id}`,
              routerLink: `/tickets/tickets/${data.ticket_id}`,
              icon: <Ticket size={18} className="inline-block text-blue-500" />
            };
            break;

          case "frota_checkout":
            normalized = {
              id: data.id,
              vehicle_id: data.ticket_id,
              message: data.message,
              routerLink: `/frotas/admin`,
              icon: <Car size={18} className="inline-block text-blue-500" />
            };
            break;
          case "frota_return":
            normalized = {
              id: data.id,
              vehicle_id: data.vehicle_id,
              message: data.message,
              routerLink: `/frotas`,
              icon: <Car size={18} className="inline-block text-blue-500" />
            };
            break;

          case "frota_solicitation":
            normalized = {
              id: data.id,
              vehicle_id: data.vehicle_id,
              message: data.message,
              routerLink: `/frotas/meus-veiculos`,
              icon: <Car size={18} className="inline-block text-blue-500" />
            };
            break;
        }


    return normalized;
  }

  const markAsRead = async (id: number) => {
    try {
      await markAsReadRemote(id);
      //@ts-ignore
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setCount((prev) => Math.max(prev - 1, 0));
      notifiedIdsRef.delete(id);
    } catch (err) {
      console.error("Erro ao marcar notificação como lida:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllAsReadRemote(notifications);
      setNotifications([]);
      setCount(0);
      notifiedIdsRef.clear();
    } catch (err) {
      console.error("Erro ao marcar todas como lidas:", err);
    }
  };

  return { notifications, count, animate, markAsRead, markAllAsRead };
}


function showBrowserNotification(title: string, options?: NotificationOptions) {
  if (!("Notification" in window)) return;

  if (Notification.permission === "granted") {
    const notif = new Notification(title, options);

    // Se quiser abrir a tela do ticket ao clicar
    notif.onclick = () => {
      if (options?.data?.url) {
        window.open(options.data.url, "_blank");
      }
    };
  }
}


// import { useEffect, useState } from "react";
// import { getWebSocket } from "../../services/websocket";
// //@ts-ignore
// import notificationSound from "../../assets/audio/notification.mp3";
// import {
//   TicketCreatedNotificationWS,
//   TicketFinishNotificationWS,
//   TicketMessageNotificationWS,
// } from "../../interface/ticket";
// //@ts-ignore
// const API_URL = import.meta.env.VITE_API_URL;

// type NotificationMessage =
//   | TicketCreatedNotificationWS
//   | TicketMessageNotificationWS
//   | TicketFinishNotificationWS;

// interface UseNotificationsProps {
//   userId: number;
// }

// export interface NotificationItem {
//   id: number;
//   ticket_id: number;
//   message: string;
//   read?: boolean;
// }

// export async function markAsReadRemote(notificationId: number): Promise<void> {
//   const response = await fetch(
//     `${API_URL}/ticket/notifications/read/${notificationId}`,
//     { method: "PATCH" }
//   );
//   if (!response.ok) throw new Error("Erro ao marcar notificação como lida");
// }

// export async function markAllAsReadRemote(
//   notifications: NotificationItem[]
// ): Promise<void> {
//   await Promise.all(
//     notifications.map((msg) =>
//       fetch(`${API_URL}/ticket/notifications/read/${msg.id}`, {
//         method: "PATCH",
//       })
//     )
//   );
// }

// export async function fetchNotifications(
//   userId: number
// ): Promise<NotificationItem[]> {
//   const response = await fetch(
//     `${API_URL}/ticket/notifications/unread/${userId}`
//   );
//   if (!response.ok) throw new Error("Erro ao buscar notificações");
//   return response.json();
// }


// export default function useNotifications({ userId }: UseNotificationsProps) {
//   const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
//   const [count, setCount] = useState(0);
//   const [animate, setAnimate] = useState(false);
//   const notifiedIdsRef = useState<Set<number>>(new Set())[0];

//   useEffect(() => {
//     if (!userId) return;

//     (async () => {
//       try {
//         const unread = await fetchNotifications(userId);
//         setNotifications(unread);
//         setCount(unread.length);

//         unread.forEach((n) => notifiedIdsRef.add(n.ticket_id));
//       } catch (err) {
//         console.error("Erro ao carregar notificações iniciais:", err);
//       }
//     })();
//   }, [userId]);

//   useEffect(() => {
//     const ws = getWebSocket();
//     if (!ws) return;

//     const handleMessage = (event: MessageEvent) => {
//       try {
//         const eventData = JSON.parse(event.data);
//         const { type, message } = eventData; // desestrutura type e message
//         const notifId = message.ticket_id;

//         // Filtra apenas tipos válidos
//         const validTypes = ["ticket_created", "ticket_message", "ticket_finish","ticket_started"];
//         if (!validTypes.includes(type)) return;


//         setNotifications((prev) => [message, ...prev]);
//         setCount((prev) => prev + 1);
//         setAnimate(true);



//         setTimeout(() => setAnimate(false), 1000);
//         if (!notifiedIdsRef.has(notifId)) {
//           notifiedIdsRef.add(notifId);
//           const audio = new Audio(notificationSound);
//           audio.play();

//         }
//       } catch (err) {
//         console.error("Erro ao processar mensagem WS:", err);
//       }
//     };

//     ws.addEventListener("message", handleMessage);
//     return () => ws.removeEventListener("message", handleMessage);
//   }, [userId]);

//   // Marcar uma notificação
//   const markAsRead = async (id: number) => {
//     try {
//       await markAsReadRemote(id);
//       setNotifications((prev) => prev.filter((n: any) => n.id !== id));
//       setCount((prev) => Math.max(prev - 1, 0));
//       notifiedIdsRef.delete(id);
//     } catch (err) {
//       console.error("Erro ao marcar notificação como lida:", err);
//     }
//   };

//   // Marcar todas
//   const markAllAsRead = async () => {
//     try {
//       await markAllAsReadRemote(notifications as NotificationItem[]);
//       setNotifications([]);
//       setCount(0);
//       notifiedIdsRef.clear();
//     } catch (err) {
//       console.error("Erro ao marcar todas como lidas:", err);
//     }
//   };

//   return { notifications, count, animate, markAsRead, markAllAsRead };
// }
