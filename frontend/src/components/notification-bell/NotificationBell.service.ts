import { useEffect, useState } from "react";
import { getWebSocket } from "../../services/websocket";
//@ts-ignore
import notificationSound from "../../assets/audio/notification.mp3";
import {
  TicketCreatedNotificationWS,
  TicketFinishNotificationWS,
  TicketMessageNotificationWS,
} from "../../interface/ticket";
//@ts-ignore
const API_URL = import.meta.env.VITE_API_URL;

type NotificationMessage =
  | TicketCreatedNotificationWS
  | TicketMessageNotificationWS
  | TicketFinishNotificationWS;

interface UseNotificationsProps {
  userId: number;
}

export interface NotificationItem {
  id: number;
  ticket_id: number;
  message: string;
  read?: boolean;
}

export async function markAsReadRemote(notificationId: number): Promise<void> {
  const response = await fetch(
    `${API_URL}/ticket/notifications/read/${notificationId}`,
    { method: "PATCH" }
  );
  if (!response.ok) throw new Error("Erro ao marcar notificação como lida");
}

export async function markAllAsReadRemote(
  notifications: NotificationItem[]
): Promise<void> {
  await Promise.all(
    notifications.map((msg) =>
      fetch(`${API_URL}/ticket/notifications/read/${msg.id}`, {
        method: "PATCH",
      })
    )
  );
}

export async function fetchNotifications(
  userId: number
): Promise<NotificationItem[]> {
  const response = await fetch(
    `${API_URL}/ticket/notifications/unread/${userId}`
  );
  if (!response.ok) throw new Error("Erro ao buscar notificações");
  return response.json();
}


export default function useNotifications({ userId }: UseNotificationsProps) {
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [count, setCount] = useState(0);
  const [animate, setAnimate] = useState(false);
  const notifiedIdsRef = useState<Set<number>>(new Set())[0];

  useEffect(() => {
    if (!userId) return;

    (async () => {
      try {
        const unread = await fetchNotifications(userId);
        setNotifications(unread);
        setCount(unread.length);

        unread.forEach((n) => notifiedIdsRef.add(n.ticket_id));
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
        const eventData = JSON.parse(event.data);
        const { type, message } = eventData; // desestrutura type e message
        const notifId = message.ticket_id;

        // Filtra apenas tipos válidos
        const validTypes = ["ticket_created", "ticket_message", "ticket_finish","ticket_started"];
        if (!validTypes.includes(type)) return;


        setNotifications((prev) => [message, ...prev]);
        setCount((prev) => prev + 1);
        setAnimate(true);



        setTimeout(() => setAnimate(false), 1000);
        if (!notifiedIdsRef.has(notifId)) {
          notifiedIdsRef.add(notifId);
          const audio = new Audio(notificationSound);
          audio.play();

        }
      } catch (err) {
        console.error("Erro ao processar mensagem WS:", err);
      }
    };

    ws.addEventListener("message", handleMessage);
    return () => ws.removeEventListener("message", handleMessage);
  }, [userId]);

  // Marcar uma notificação
  const markAsRead = async (id: number) => {
    try {
      await markAsReadRemote(id);
      setNotifications((prev) => prev.filter((n: any) => n.id !== id));
      setCount((prev) => Math.max(prev - 1, 0));
      notifiedIdsRef.delete(id);
    } catch (err) {
      console.error("Erro ao marcar notificação como lida:", err);
    }
  };

  // Marcar todas
  const markAllAsRead = async () => {
    try {
      await markAllAsReadRemote(notifications as NotificationItem[]);
      setNotifications([]);
      setCount(0);
      notifiedIdsRef.clear();
    } catch (err) {
      console.error("Erro ao marcar todas como lidas:", err);
    }
  };

  return { notifications, count, animate, markAsRead, markAllAsRead };
}
