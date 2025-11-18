export type WsNotificationType =
  | "ticket_created"
  | "ticket_message"
  | "ticket_started"
  | "ticket_finish"
  | "frota_checkout"
  | "frota_return"
  | "frota_solicitation"
  | "fuel_reminder"; // ✅ ADICIONAR AQUI

export interface WsNotification<T> {
  type: WsNotificationType;
  message: T;
}

export interface TicketCreatedNotificationWS {
  id: number
  ticket_id: number
  message: string
}

export interface TicketMessageNotificationWS {
  id: number
  ticket_id: number;
  sender_id: number;
  text: string;
}

export interface TicketFinishNotificationWS {
  id: number
  ticket_id: number;
  closed_by: number;
  reason: string;
}

export interface FrotaCheckoutNotificationWS {
  id: number
  vehicle_id: number
  vehicle: string
  message: string
}

export interface FrotaReturntNotificationWS {
  id: number
  vehicle_id: number
  vehicle: string
  message: string
}

export interface FrotaSolicitationNotificationWS {
  id: number
  vehicle_id: number
  vehicle: string
  message: string
}

// ✅ ADICIONAR NOVA INTERFACE PARA FUEL REMINDER
export interface FuelReminderNotificationWS {
  id: number
  vehicle_id: number
  message: string
  notification_type: "fuel_reminder"
}

// Notificação genérica - ATUALIZAR
export type WsNotificationPayload =
  | { type: "ticket_created"; message: TicketCreatedNotificationWS }
  | { type: "ticket_message"; message: TicketMessageNotificationWS }
  | { type: "ticket_finish"; message: TicketFinishNotificationWS }
  | { type: "frota_checkout"; message: TicketCreatedNotificationWS }
  | { type: "frota_return"; message: FrotaReturntNotificationWS }
  | { type: "frota_solicitation"; message: FrotaSolicitationNotificationWS }
  | { type: "fuel_reminder"; message: FuelReminderNotificationWS }; // ✅ ADICIONAR AQUI