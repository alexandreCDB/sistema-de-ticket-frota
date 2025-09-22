export interface NotificationItem {
    id: number
    user_id: number
    ticket_id: number
    message: string
    notification_type: string
    is_read: boolean
    created_at: Date
}

export enum NotificationType {
    ticket_created = "ticket_created",
    message_sent = "message_sent"
}