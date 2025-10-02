import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AnimatedPageWrapper from '../../../components/Animated/AnimatedPageWrapper';
import * as TicketService from './TicketDetail.service';
// import Picker from "emoji-picker-react";
//@ts-ignore
import './TicketDetail.css';
//@ts-ignore
import './Forms.css';
import { IUser } from '../../../components/AUTH/interfaces/user';
import { useAuth } from '../../services/App.services';
import { connectWebSocket, getWebSocket } from '../../../services/websocket';
import Loading from '../../../components/Loads/Loading';

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

  const [showPicker, setShowPicker] = useState(false);

  const onEmojiClick = (emojiData: any) => {
    setNewMessageContent(prev => prev + emojiData.emoji);
  };
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  useEffect(() => { scrollToBottom(); }, [totalMsg]);
  // ---------------- WebSocket ----------------
  useEffect(() => {

    if (!getWebSocket()) {
      connectWebSocket();
    }
    const ws = getWebSocket();


    if (!ws) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const eventData = JSON.parse(event.data);
        const { type, message } = eventData;

        if (type === 'ticket_message_page' && message.ticket_id === Number(ticketId)) {

          setMessages(prev => [...prev, message]); // aqui deve adicionar à lista
          setTotalMsg(prev => prev + 1);
        }
      } catch (err) {
        console.error("Erro ao processar mensagem WS:", err);
      }
    };

    ws.addEventListener("message", handleMessage);
    return () => ws.removeEventListener("message", handleMessage);
  }, [ticketId]);


  // ---------------- Fetch ticket e mensagens ----------------
  useEffect(() => {
    if (!ticketId) return;
    const fetchTicketData = async () => {
      try {
        setLoading(true);
        const data = await TicketService.fetchTicket(parseInt(ticketId));
        setTicket(data);
        setSelectedAssigneeId(data.assignee?.id?.toString() || '');

        // if (TicketService.canExchangeMessages(data.status)) {
          const msgs = await TicketService.fetchMessages(data.id);
          setMessages(msgs);
          setTotalMsg(msgs.length);
        // }

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
  if (loading || loadingUser) return <Loading />;
  if (error || userError) return <div style={{ color: 'red' }}>Erro: {error || userError}</div>;
  if (!ticket || !user) return <div>Ticket não encontrado</div>;

  const isUserAdmin = user.is_admin;
  const isUserSuperAdmin = user.is_super_admin;
  const isTicketClosed = TicketService.isTicketClosed(ticket.status);
  const enableMessageForm = TicketService.canExchangeMessages(ticket.status);



  return (
    <AnimatedPageWrapper>
      <div className="ticket-detail-container">
        <button onClick={() => navigate('/tickets/tickets')} className="btn-voltar">
          ← Voltar
        </button>

        <h3>Chamado #{ticket.id}</h3>
        <h3>{ticket.title}</h3>
        <div className="detail-card">
          <p><strong>Titulo:</strong> {ticket.title}</p>
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
          <div className="close-ticket-action">
            <button onClick={handleAttendTicket} disabled={attendingTicket}>
              {attendingTicket ? 'Atendendo...' : 'Atender Chamado'}
            </button>
            {attendError && <p style={{ color: 'red' }}>{attendError}</p>}
          </div>
        )}

        {isUserSuperAdmin && !isTicketClosed && (
          <div className="delegation-section detail-card">
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


        <hr className="divider" />
        <h4>Mensagens</h4>

        <div className="messages-wrapper">
          <div className="messages-section">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`message-row ${msg.sender_id === user.id ? "my-message" : "other-message"
                  }`}
              >
                <div className="message-bubble">
                  <div className="message-header">
                    <strong>
                      {msg.sender_id === user.id
                        ? "Você"
                        : TicketService.getUsernameFromEmail(msg.sender_email)}
                    </strong>
                  </div>
                  <div className="message-content">{msg.content}</div>
                  <span className="message-time">
                    <span className="message-time">{new Date(msg.sent_at).toLocaleString()}</span>
                    {/* {new Date(msg.sent_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })} */}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* 
            
            IMPLEMENTAÇÃO DO PICKER DE EMOJI - COMENTADO POR ENQUANTO
            FUNCIONAL
            <form onSubmit={handleSendMessage} className="message-form">
              <div className="textarea-wrapper">
                <textarea
                  value={newMessageContent}
                  onChange={e => setNewMessageContent(e.target.value)}
                  rows={4}
                  placeholder="Digite sua mensagem..."
                  disabled={sendingMessage}
                />

                <button
                  type="button"
                  onClick={() => setShowPicker(prev => !prev)}
                  style={{
                    position: "absolute",
                    right: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "20px",
                    zIndex: 5
                  }}
                >
                  😊
                </button>

                {showPicker && (
          <div style={{
            position: "absolute",
            bottom: "50px",
            right: "0",
            zIndex: 10
          }}>
            <Picker onEmojiClick={onEmojiClick} />
          </div>
        )}
      </div>

              <button className="send-msg" type="submit" disabled={sendingMessage}>
                {sendingMessage ? "Enviando..." : "Enviar Mensagem"}
              </button>
            </form> */}
        {enableMessageForm && (
          <>
            <form onSubmit={handleSendMessage} className="message-form">
              <textarea value={newMessageContent} onChange={e => setNewMessageContent(e.target.value)} rows={4} placeholder="Digite sua mensagem..." disabled={sendingMessage} />
              <button className="send-msg" type="submit" disabled={sendingMessage}>{sendingMessage ? 'Enviando...' : 'Enviar Mensagem'}</button>
            </form>
          </>
        )}

        {(isUserAdmin || isUserSuperAdmin) && ticket.status.toLowerCase() === 'em progresso' && (
          <div className="close-ticket-action ">
            <button className="button-danger" onClick={() => setShowObsModal(true)}>Fechar Chamado</button>
          </div>
        )}

        {showObsModal && (
          <div className="modal-backdrop">
            <div className="modal-content">
              <h2>Inserir Observação</h2>
              <textarea value={obsText} onChange={e => setObsText(e.target.value)} rows={5} placeholder="Digite sua observação..." />
              <div className="modal-actions">
                <button className='cancelar' onClick={() => setShowObsModal(false)}>Cancelar</button>
                <button className='finalizar' onClick={handleFinalizeClose} disabled={closingTicket}>Finalizar</button>
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


