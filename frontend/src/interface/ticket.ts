export type WsNotificationType =
    | "ticket_created"
    | "ticket_message"
    | "ticket_finish";



export interface WsNotification<T> {
    type: WsNotificationType;
    message: T;
}

export interface TicketCreatedNotificationWS {
    ticket_id: number
    message: string
}

export interface TicketMessageNotificationWS {
  ticket_id: number;
  sender_id: number;
  text: string;
}

export interface TicketFinishNotificationWS {
  ticket_id: number;
  closed_by: number;
  reason: string;
}

// Notificação genérica
export type WsNotificationPayload =
  | { type: "ticket_created"; message: TicketCreatedNotificationWS }
  | { type: "ticket_message"; message: TicketMessageNotificationWS }
  | { type: "ticket_finish"; message: TicketFinishNotificationWS };



