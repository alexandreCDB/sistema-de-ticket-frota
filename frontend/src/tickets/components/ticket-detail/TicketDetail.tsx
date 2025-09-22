import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AnimatedPageWrapper from '../../../components/Animated/AnimatedPageWrapper';
import * as TicketService from './TicketDetail.service';
import './TicketDetail.css';
import './Forms.css';
import { IUser } from '../../../components/AUTH/interfaces/user';
import { useAuth } from '../../services/App.services';

const TicketDetail: React.FC = () => {
  const { user, loadingUser, userError } = useAuth();
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<TicketService.Ticket | null>(null);
  const [messages, setMessages] = useState<TicketService.Message[]>([]);
  const [totalMsg, setTotalMsg] = useState(0);
  const [newMessageContent, setNewMessageContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [closingTicket, setClosingTicket] = useState(false);
  const [closeError, setCloseError] = useState<string | null>(null);
  const [showObsModal, setShowObsModal] = useState(false);
  const [obsText, setObsText] = useState('');

  const [assignableUsers, setAssignableUsers] = useState<IUser[]>([]);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>('');
  const [updatingAssignee, setUpdatingAssignee] = useState(false);
  const [assigneeUpdateError, setAssigneeUpdateError] = useState<string | null>(null);

  const [attendingTicket, setAttendingTicket] = useState(false);
  const [attendError, setAttendError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ---------------- Fetch ticket e mensagens ----------------
  useEffect(() => {
    if (!ticketId) return;
    const fetchTicketData = async () => {
      try {
        setLoading(true);
        const data = await TicketService.fetchTicket(parseInt(ticketId));
        setTicket(data);
        setSelectedAssigneeId(data.assignee?.id?.toString() || '');

        if (TicketService.canExchangeMessages(data.status)) {
          const msgs = await TicketService.fetchMessages(data.id);
          setMessages(msgs);
          setTotalMsg(msgs.length);
        }

        const users = await TicketService.fetchAssignableUsers();
        setAssignableUsers(users);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTicketData();
  }, [ticketId]);

  useEffect(() => {
    scrollToBottom();
  }, [totalMsg]);

  // ---------------- Enviar nova mensagem ----------------
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket || !user) return;
    if (!newMessageContent.trim()) return;

    setSendingMessage(true);
    try {
      const msg = await TicketService.sendMessage(ticket.id, user.id, newMessageContent);
      setMessages([...messages, msg]);
      setNewMessageContent('');
      setTotalMsg(totalMsg + 1);
    } catch (err: any) {
      console.error(err);
    } finally {
      setSendingMessage(false);
    }
  };

  // ---------------- Atualizar assignee ----------------
  const handleUpdateAssignee = async () => {
    if (!ticket) return;
    setUpdatingAssignee(true);
    setAssigneeUpdateError(null);

    try {
      const updatedTicket = await TicketService.updateAssignee(
        ticket.id,
        selectedAssigneeId ? parseInt(selectedAssigneeId) : null
      );
      setTicket(updatedTicket);
      alert('Atribuição atualizada com sucesso!');
    } catch (err: any) {
      setAssigneeUpdateError(err.message);
    } finally {
      setUpdatingAssignee(false);
    }
  };

  // ---------------- Atender ticket ----------------
  const handleAttendTicket = async () => {
    if (!ticket) return;
    setAttendingTicket(true);
    setAttendError(null);
    try {
      const updatedTicket = await TicketService.attendTicket(ticket.id);
      setTicket(updatedTicket);

      if (TicketService.canExchangeMessages(updatedTicket.status)) {
        const msgs = await TicketService.fetchMessages(updatedTicket.id);
        setMessages(msgs);
        setTotalMsg(msgs.length);
      }
    } catch (err: any) {
      setAttendError(err.message);
    } finally {
      setAttendingTicket(false);
    }
  };

  // ---------------- Fechar ticket ----------------
  const handleFinalizeClose = async () => {
    if (!ticket) return;
    if (!obsText.trim()) {
      alert('A observação é obrigatória!');
      return;
    }

    setClosingTicket(true);
    setCloseError(null);

    try {
      const updatedTicket = await TicketService.closeTicket(ticket.id, obsText);
      setTicket(updatedTicket);
      setShowObsModal(false);
      alert('Chamado fechado com sucesso!');
    } catch (err: any) {
      setCloseError(err.message);
    } finally {
      setClosingTicket(false);
    }
  };

  // ---------------- Render ----------------
  if (loading || loadingUser) return <div>Carregando...</div>;
  if (error || userError) return <div style={{ color: 'red' }}>Erro: {error || userError}</div>;
  if (!ticket || !user) return <div>Ticket não encontrado</div>;

  const isUserAdmin = user.is_admin;
  const isUserSuperAdmin = user.is_super_admin;
  const isTicketClosed = TicketService.isTicketClosed(ticket.status);
  const enableMessageForm = TicketService.canExchangeMessages(ticket.status);

  return (
    <AnimatedPageWrapper>
      <div className="ticket-detail-container">
        <button onClick={() => navigate('/dashboard/tickets')} className="btn-voltar">
          ← Voltar
        </button>

        <h3>Chamado #{ticket.id} - {ticket.title}</h3>
        <div className="detail-card">
          <p><strong>Status:</strong> <span className={`status-${ticket.status.toLowerCase()}`}>{ticket.status}</span></p>
          <p><strong>Prioridade:</strong> {ticket.priority}</p>
          <p><strong>Categoria:</strong> {TicketService.formatCategoryName(ticket.category)}</p>
          <p><strong>Solicitante:</strong> {TicketService.getUsernameFromEmail(ticket.requester?.email)}</p>
          <p><strong>Atribuído:</strong> {ticket.assignee?.email || 'Não atribuído'}</p>
          <p><strong>Descrição:</strong> {ticket.description}</p>
          <p><strong>Aberto em:</strong> {new Date(ticket.created_at).toLocaleString()}</p>
          <p><strong>Última atualização:</strong> {new Date(ticket.updated_at).toLocaleString()}</p>
          {isTicketClosed && <p><strong>Observação:</strong> {ticket.observation}</p>}
        </div>

        {(isUserAdmin || isUserSuperAdmin) && ticket.status.toLowerCase() === 'aberto' && (
          <div className="attend-ticket-action mt-20">
            <button onClick={handleAttendTicket} disabled={attendingTicket}>
              {attendingTicket ? 'Atendendo...' : 'Atender Chamado'}
            </button>
            {attendError && <p style={{ color: 'red' }}>{attendError}</p>}
          </div>
        )}

        {isUserSuperAdmin && !isTicketClosed && (
          <div className="delegation-section mt-20 detail-card">
            <h4>Delegar Chamado</h4>
            <select value={selectedAssigneeId} onChange={e => setSelectedAssigneeId(e.target.value)} disabled={updatingAssignee}>
              <option value="">Não Atribuído</option>
              {assignableUsers.map(u => (
                <option key={u.id} value={u.id}>{u.email} ({u.is_super_admin ? 'SuperAdmin' : 'Técnico'})</option>
              ))}
            </select>
            <button onClick={handleUpdateAssignee} disabled={updatingAssignee}>
              {updatingAssignee ? 'Atualizando...' : 'Atualizar Atribuição'}
            </button>
            {assigneeUpdateError && <p style={{ color: 'red' }}>{assigneeUpdateError}</p>}
          </div>
        )}

        {enableMessageForm && (
          <>
            <hr className="divider" />
            <h4>Mensagens</h4>
            <div className="messages-section">
              {messages.map(msg => (
                <div key={msg.id} className={`message-item ${msg.sender_id === user.id ? 'my-message' : 'other-message'}`}>
                  <strong>{msg.sender_id === user.id ? 'Você' : TicketService.getUsernameFromEmail(msg.sender_email)}</strong>
                  : {msg.content}
                  <span className="message-time">{new Date(msg.sent_at).toLocaleString()}</span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="message-form mt-20">
              <textarea value={newMessageContent} onChange={e => setNewMessageContent(e.target.value)} rows={4} placeholder="Digite sua mensagem..." disabled={sendingMessage} />
              <button type="submit" disabled={sendingMessage}>{sendingMessage ? 'Enviando...' : 'Enviar Mensagem'}</button>
            </form>
          </>
        )}

        {(isUserAdmin || isUserSuperAdmin) && ticket.status.toLowerCase() === 'em progresso' && (
          <div className="close-ticket-action mt-20">
            <button onClick={() => setShowObsModal(true)}>Fechar Chamado</button>
          </div>
        )}

        {showObsModal && (
          <div className="modal-backdrop">
            <div className="modal-content">
              <h2>Inserir Observação</h2>
              <textarea value={obsText} onChange={e => setObsText(e.target.value)} rows={5} placeholder="Digite sua observação..." />
              <div className="modal-actions">
                <button onClick={() => setShowObsModal(false)}>Cancelar</button>
                <button onClick={handleFinalizeClose} disabled={closingTicket}>Finalizar</button>
              </div>
              {closeError && <p style={{ color: 'red' }}>{closeError}</p>}
            </div>
          </div>
        )}
      </div>
    </AnimatedPageWrapper>
  );
};

export default TicketDetail;
