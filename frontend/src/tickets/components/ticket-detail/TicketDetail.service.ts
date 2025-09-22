import { IUser } from "../../../components/AUTH/interfaces/user";

//@ts-ignore
const API_URL = import.meta.env.VITE_API_URL;


export interface Message {
  id: number;
  ticket_id: number;
  sender_id: number;
  sender_email?: string;
  content: string;
  sent_at: string;
}

export interface Message {
  id: number;
  content: string;
  sender_id: number;
  sender_email?: string;
  sent_at: string;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  requester?: IUser;
  assignee?: IUser;
  observation?: string;
  created_at: string;
  updated_at: string;
}

// ---------------- Funções utilitárias ----------------
export const isTicketClosed = (status: string) => {
  const lower = status.toLowerCase();
  return ['resolvido', 'fechado', 'cancelado'].includes(lower);
};

export const canExchangeMessages = (status: string) => {
  const lower = status.toLowerCase();
  return lower !== 'aberto' && !isTicketClosed(lower);
};

export const formatCategoryName = (category: string) => {
  switch (category) {
    case 'rede_e_internet': return 'Rede e Internet';
    case 'equipamentos': return 'Equipamentos';
    case 'sistemas_e_programas': return 'Sistemas e Programas';
    case 'acessos_e_senhas': return 'Acessos e Senhas';
    case 'email_e_comunicacao': return 'E-mail e Comunicação';
    case 'seguranca_da_informacao': return 'Segurança da Informação';
    case 'solicitacao_de_servico': return 'Solicitação de Serviço';
    case 'outros': return 'Outros';
    default: return category;
  }
};

export const getUsernameFromEmail = (email?: string) => {
  if (!email) return 'N/A';
  const atIndex = email.indexOf('@');
  return atIndex > -1 ? email.substring(0, atIndex) : email;
};

// ---------------- Fetch ----------------
export const fetchTicket = async (ticketId: number): Promise<Ticket> => {
  const res = await fetch(`${API_URL}/ticket/tickets/${ticketId}`, { credentials: 'include' });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || 'Falha ao buscar ticket');
  }
  return res.json();
};

export const fetchMessages = async (ticketId: number): Promise<Message[]> => {
  const res = await fetch(`${API_URL}/ticket/tickets/${ticketId}/messages/`, { credentials: 'include' });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || 'Falha ao buscar mensagens');
  }
  return res.json();
};

export const sendMessage = async (ticketId: number, userId: number, content: string): Promise<Message> => {
  const res = await fetch(`${API_URL}/ticket/tickets/${ticketId}/messages/`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticket_id: ticketId, sender_id: userId, content }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || 'Falha ao enviar mensagem');
  }
  return res.json();
};

export const fetchAssignableUsers = async (): Promise<IUser[]> => {
  const res = await fetch(`${API_URL}/ticket/users/assignable/`, { credentials: 'include' });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || 'Falha ao buscar usuários atribuíveis');
  }
  return res.json();
};

export const updateAssignee = async (ticketId: number, assigneeId: number | null): Promise<Ticket> => {
  const formData = new FormData();
  formData.append('assignee_id', assigneeId === null ? '' : assigneeId.toString());

  const res = await fetch(`${API_URL}/ticket/tickets/${ticketId}`, {
    method: 'PUT',
    credentials: 'include',
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || 'Falha ao atualizar atribuição');
  }
  return res.json();
};

export const attendTicket = async (ticketId: number): Promise<Ticket> => {
  const res = await fetch(`${API_URL}/ticket/tickets/${ticketId}/accept`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || 'Falha ao atender chamado');
  }
  return res.json();
};

export const closeTicket = async (ticketId: number, observation: string): Promise<Ticket> => {
  const res = await fetch(`${API_URL}/ticket/tickets/${ticketId}/close`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ observation }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || 'Falha ao fechar chamado');
  }
  return res.json();
};
