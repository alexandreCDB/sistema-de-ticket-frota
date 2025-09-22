import { NotificationItem } from "./type";

//@ts-ignore
const API_URL = import.meta.env.VITE_API_URL;


// Buscar notificações não lidas
export async function fetchNotifications(userId: number): Promise<NotificationItem[]> {
  const response = await fetch(`${API_URL}/ticket/notifications/unread/${userId}`);
  if (!response.ok) throw new Error("Erro ao buscar notificações");
  return response.json();
}

// Marcar notificação como lida
export async function markAsRead(notificationId: number): Promise<void> {
  const response = await fetch(`${API_URL}/ticket/notifications/read/${notificationId}`, {
    method: "PATCH",
  });
  if (!response.ok) throw new Error("Erro ao marcar notificação como lida");
}

// Marcar todas como lidas
export async function markAllAsRead(notifications: NotificationItem[]): Promise<void> {
  await Promise.all(
    notifications.map((msg) =>
      fetch(`${API_URL}/ticket/notifications/read/${msg.id}`, {
        method: "PATCH",
      })
    )
  );
}
