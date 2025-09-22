
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AnimatedPageWrapper from '../../../components/Animated/AnimatedPageWrapper';
import { fetchTickets, TicketResponse } from './TicketList.service';


export interface User {
  id: number;
  email: string;
  name?: string;
}

export interface Ticket {
  id: number;
  title: string;
  category: string;
  priority: 'baixa' | 'média' | 'Alta';
  status: string;
  requester?: User;
  assignee?: User;
  created_at: string;
}

interface TicketListProps {
  user: User | null;
  ticketType: 'my-tickets' | 'assigned-tickets' | 'all-tickets';
  status?: string[];
  includeClosedOrResolved?: boolean;
}

const TicketList: React.FC<TicketListProps> = ({
  user,
  ticketType,
  status,
  includeClosedOrResolved = false,
}) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalTickets, setTotalTickets] = useState<number>(0);
  const limit = 10;

  const formatCategoryName = (categoryValue: string) => {
    switch (categoryValue) {
      case 'rede_e_internet': return 'Rede e Internet';
      case 'equipamentos': return 'Equipamentos';
      case 'sistemas_e_programas': return 'Sistemas e Programas';
      case 'acessos_e_senhas': return 'Acessos e Senhas';
      case 'email_e_comunicacao': return 'E-mail e Comunicação';
      case 'seguranca_da_informacao': return 'Segurança da Informação';
      case 'solicitacao_de_servico': return 'Solicitação de Serviço';
      case 'outros': return 'Outros';
      default: return categoryValue;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'aberto': return 'status-aberto';
      case 'em progresso': return 'status-em-processo';
      case 'fechado': return 'status-concluido';
      case 'resolvido': return 'status-resolvido';
      case 'esperando usuario': return 'status-esperando-usuario';
      case 'cancelado': return 'status-cancelado';
      default: return '';
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'baixa': return 'priority-baixa';
      case 'média': return 'priority-media';
      case 'alta': return 'priority-alta';
      default: return '';
    }
  };

  const getUsernameFromEmail = (email?: string) => {
    if (!email) return 'N/A';
    const atIndex = email.indexOf('@');
    return atIndex > -1 ? email.substring(0, atIndex) : email;
  };

  const handlePreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage(prev => prev + 1);

  const totalPages = Math.ceil(totalTickets / limit);

  useEffect(() => {
    const loadTickets = async () => {
      setLoading(true);
      setError(null);
      try {
        const data: TicketResponse<Ticket> = await fetchTickets({
          ticketType,
          status,
          includeClosedOrResolved,
          skip: (currentPage - 1) * limit,
          limit,
        });
        setTickets(data.items);
        setTotalTickets(data.total_tickets);
      } catch (err: any) {
        setError(err.message || 'Não foi possível carregar os tickets.');
      } finally {
        setLoading(false);
      }
    };

    if (user) loadTickets();
  }, [user, ticketType, status, includeClosedOrResolved, currentPage]);

  let listTitle = 'Chamados';
  if (ticketType === 'my-tickets') {
    const isReport = status && (status.includes('resolvido') || status.includes('fechado') || status.includes('cancelado'));
    listTitle = isReport ? 'Chamados Encerrados' : 'Chamados Feitos (Ativos)';
  } else if (ticketType === 'assigned-tickets') {
    listTitle = includeClosedOrResolved ? 'Relatório de Chamados' : 'Chamados Recebidos / Abertos';
  } else if (ticketType === 'all-tickets') {
    listTitle = 'Todos os Chamados';
  }

  if (loading) return <div className="ticket-list-container">Carregando tickets...</div>;
  if (error) return <div className="ticket-list-container" style={{ color: 'red' }}>Erro: {error}</div>;

  return (
    <AnimatedPageWrapper>
      <div className="ticket-list-container">
        <h3>{listTitle}</h3>
        {tickets.length === 0 ? (
          <p>Nenhum chamado encontrado.</p>
        ) : (
          <>
            <div className="ticket-card-grid">
              {tickets.map(ticket => (
                <div key={ticket.id} className="ticket-card">
                  <div className="ticket-card-header">
                    <h4 className="ticket-title">{ticket.title}</h4>
                    <span className={`priority-badge ${getPriorityClass(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </div>
                  <div className="ticket-card-body">
                    <p><strong>Categoria:</strong> {formatCategoryName(ticket.category)}</p>
                    <p><strong>Solicitante:</strong> {getUsernameFromEmail(ticket.requester?.email)}</p>
                    {(ticketType === 'assigned-tickets' || ticketType === 'all-tickets') && (
                      <>
                        <p>
                          <strong>Status:</strong>{' '}
                          <span className={getStatusClass(ticket.status)}>
                            {ticket.status.replace(/_/g, ' ')}
                          </span>
                        </p>
                        <p><strong>Atribuído:</strong> {ticket.assignee?.email || 'N/A'}</p>
                        <p><strong>Abertura:</strong> {new Date(ticket.created_at).toLocaleDateString()}</p>
                      </>
                    )}
                  </div>
                  <div className="ticket-card-footer">
                    <Link to={`/tickets/tickets/${ticket.id}`} className="details-button">
                      Detalhes
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {totalTickets > limit && (
              <div className="pagination-controls">
                <button onClick={handlePreviousPage} disabled={currentPage === 1}>
                  Anterior
                </button>
                <span>Página {currentPage} de {totalPages}</span>
                <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                  Próximo
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AnimatedPageWrapper>
  );
};

export default TicketList;
// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import './TicketList.css';
// import AnimatedPageWrapper from '../../../components/Animated/AnimatedPageWrapper'

// function TicketList({ user, ticketType, status, includeClosedOrResolved, requesterId, assigneeId }) { 
//     // Estado para os dados da lista de tickets
//     const [tickets, setTickets] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     // Estado para a paginação
//     const [currentPage, setCurrentPage] = useState(1);
//     const [totalTickets, setTotalTickets] = useState(0);
//     const limit = 10; // Quantidade de itens por página

//     const formatCategoryName = (categoryValue) => {
//         switch (categoryValue) {
//             case 'rede_e_internet':
//                 return 'Rede e Internet';
//             case 'equipamentos':
//                 return 'Equipamentos';
//             case 'sistemas_e_programas':
//                 return 'Sistemas e Programas';
//             case 'acessos_e_senhas':
//                 return 'Acessos e Senhas';
//             case 'email_e_comunicacao':
//                 return 'E-mail e Comunicação';
//             case 'seguranca_da_informacao':
//                 return 'Segurança da Informação';
//             case 'solicitacao_de_servico':
//                 return 'Solicitação de Serviço';
//             case 'outros':
//                 return 'Outros';
//             default:
//                 return categoryValue;
//         }
//     };

//     // A função `useEffect` agora depende de `currentPage` para refazer a requisição
//     useEffect(() => {
//         const currentToken = localStorage.getItem('access_token');
        
//         const fetchTickets = async () => { 
//             setLoading(true);
//             setError(null);
            
//             if (!currentToken) { 
//                 setError('Você precisa estar logado para ver os tickets.');
//                 setLoading(false);
//                 return;
//             }

//             try {
//                 let endpoint = '';
//                 const params = new URLSearchParams();
                
//                 // Calcule o 'skip' com base na página atual
//                 const skip = (currentPage - 1) * limit;
//                 params.append('skip', skip);
//                 params.append('limit', limit);

//                 if (ticketType === 'my-tickets') {
//                     endpoint = '/api/tickets/my-tickets/';
//                     if (status && status.length > 0) {
//                         status.forEach(s => params.append('status', s)); 
//                     }
//                 } else if (ticketType === 'assigned-tickets') {
//                     endpoint = '/api/tickets/assigned-to-me-or-unassigned/';
//                     if (status && status.length > 0) {
//                         status.forEach(s => params.append('status', s)); 
//                     }
//                     if (includeClosedOrResolved) { 
//                         params.append('include_closed_or_resolved', 'true');
//                     }
//                 } else if (ticketType === 'all-tickets') { 
//                     endpoint = '/api/tickets/all/';
//                     if (status && status.length > 0) {
//                         status.forEach(s => params.append('status', s));
//                     }
//                     if (includeClosedOrResolved) {
//                         params.append('include_closed_or_resolved', 'true');
//                     }
//                 } else {
//                     setError('Tipo de lista de tickets inválido ou não autorizado.');
//                     setLoading(false);
//                     return;
//                 }

//                 const fullEndpoint = `${endpoint}${params.toString() ? `?${params.toString()}` : ''}`; 
//                 console.log("URL da API sendo chamada:", fullEndpoint); 

//                 const response = await fetch(fullEndpoint, { 
//                     headers: {
//                         'Authorization': `Bearer ${currentToken}` 
//                     }
//                     ,credentials:true
//                 });

//                 if (!response.ok) {
//                     const errorData = await response.json();
//                     throw new Error(errorData.detail || 'Falha ao buscar tickets.');
//                 }

//                 // A resposta agora é um objeto
//                 const data = await response.json();
//                 console.log("Dados recebidos da API:", data); 

//                 // Atualize o estado com os dados da resposta, incluindo a contagem total
//                 setTickets(data.items);
//                 setTotalTickets(data.total_tickets);

//             } catch (err) {
//                 console.error("Erro ao buscar tickets:", err);
//                 setError(err.message || 'Não foi possível carregar os tickets.');
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchTickets(); 
//     }, [user, ticketType, status, includeClosedOrResolved, currentPage]);

//     const getStatusClass = (status) => {
//         switch (status) {
//             case 'aberto': 
//                 return 'status-aberto';
//             case 'em progresso': 
//                 return 'status-em-processo';
//             case 'fechado': 
//                 return 'status-concluido';
//             case 'resolvido': 
//                 return 'status-resolvido';
//             case 'esperando usuario': 
//                 return 'status-esperando-usuario';
//             case 'cancelado': 
//                 return 'status-cancelado';
//             default:
//                 return '';
//         }
//     };

//     const getUsernameFromEmail = (email) => {
//         if (!email) return 'N/A';
//         const atIndex = email.indexOf('@');
//         return atIndex > -1 ? email.substring(0, atIndex) : email;
//     };

//     const getPriorityClass = (priority) => {
//         switch (priority) {
//             case 'baixa':
//                 return 'priority-baixa';
//             case 'média': 
//                 return 'priority-media';
//             case 'Alta': 
//                 return 'priority-alta';
//             default:
//                 return '';
//         }
//     };

//     // Funções para gerenciar a navegação das páginas
//     const handlePreviousPage = () => {
//         setCurrentPage(prev => Math.max(prev - 1, 1));
//     };

//     const handleNextPage = () => {
//         setCurrentPage(prev => prev + 1);
//     };

//     // Calcule o número total de páginas
//     const totalPages = Math.ceil(totalTickets / limit);

//     if (loading) {
//         return <div className="ticket-list-container">Carregando tickets...</div>;
//     }

//     if (error) {
//         return <div className="ticket-list-container" style={{ color: 'red' }}>Erro: {error}</div>;
//     }

//     let listTitle = "Chamados";
//     if (ticketType === 'my-tickets') {
//         const isReport = status && (status.includes('resolvido') || status.includes('fechado') || status.includes('cancelado'));
//         listTitle = isReport ? 'Chamados Encerrados' : 'Chamados Feitos (Ativos)';
//     } else if (ticketType === 'assigned-tickets') {
//         listTitle = includeClosedOrResolved ? 'Relatório de Chamados' : 'Chamados Recebidos / Abertos';
//     } else if (ticketType === 'all-tickets') {
//         listTitle = 'Todos os Chamados';
//     }

//     return (
//         <AnimatedPageWrapper>
//             <div className="ticket-list-container">
//                 <h3>{listTitle}</h3>

//                 {tickets.length === 0 ? (
//                     <p>Nenhum chamado encontrado.</p>
//                 ) : (
//                     <>
//                         <div className="ticket-card-grid">
//                             {tickets.map(ticket => (
//                                 <div key={ticket.id} className="ticket-card">
//                                     <div className="ticket-card-header">
//                                         <h4 className="ticket-title">{ticket.title}</h4>
//                                         <span className={`priority-badge ${getPriorityClass(ticket.priority)}`}>
//                                             {ticket.priority}
//                                         </span>
//                                     </div>

//                                     <div className="ticket-card-body">
//                                         <p><strong>Categoria:</strong> {formatCategoryName(ticket.category)}</p>
//                                         <p><strong>Solicitante:</strong> {getUsernameFromEmail(ticket.requester?.email)}</p>

//                                         {(ticketType === 'assigned-tickets' || ticketType === 'all-tickets') && (
//                                             <>
//                                                 <p>
//                                                     <strong>Status:</strong>{' '}
//                                                     <span className={getStatusClass(ticket.status)}>
//                                                         {ticket.status.replace(/_/g, ' ')}
//                                                     </span>
//                                                 </p>
//                                                 <p><strong>Atribuído:</strong> {ticket.assignee?.email || 'N/A'}</p>
//                                                 <p><strong>Abertura:</strong> {new Date(ticket.created_at).toLocaleDateString()}</p>
//                                             </>
//                                         )}
//                                     </div>

//                                     <div className="ticket-card-footer">
//                                         <Link to={`/dashboard/tickets/${ticket.id}`} className="details-button">
//                                             Detalhes
//                                         </Link>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>

//                         {totalTickets > limit && (
//                             <div className="pagination-controls">
//                                 <button onClick={handlePreviousPage} disabled={currentPage === 1}>
//                                     Anterior
//                                 </button>
//                                 <span>Página {currentPage} de {totalPages}</span>
//                                 <button onClick={handleNextPage} disabled={currentPage === totalPages}>
//                                     Próximo
//                                 </button>
//                             </div>
//                         )}
//                     </>
//                 )}
//             </div>

//         </AnimatedPageWrapper>
//     );
// }

// export default TicketList;