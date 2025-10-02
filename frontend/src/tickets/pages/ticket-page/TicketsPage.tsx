// frontend/src/components/TicketsPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
//@ts-ignore
import './TicketsPage.css';
import AnimatedPageWrapper from '../../../components/Animated/AnimatedPageWrapper'

import { useDashboardStats } from '../deshboard-panel/DashboardPanels.service';
import TicketList from '../../components/ticket-list/TicketList';
import { useAuth } from '../../../components/AUTH/AuthContext';

// ADICIONE ESTE MAPA DE STATUS AQUI (se não estiver já)
const STATUS_MAP = {
    'open': 'aberto',
    'in_progress': 'em progresso',
    'resolved': 'resolvido',
    'closed': 'fechado',
    'waiting_for_user': 'esperando usuario',
    'cancelled': 'cancelado'
};

function TicketsPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('');
    const { user, loadingUser, userError } = useAuth();
    const { stats, loading, error } = useDashboardStats();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const tabFromUrl = queryParams.get('tab');
        let newActiveTab = '';

        if (tabFromUrl) {
            if (tabFromUrl.startsWith('my-')) {
                newActiveTab = tabFromUrl;
            } else if ((user?.is_admin || user?.is_super_admin) && (tabFromUrl.startsWith('assigned-') || tabFromUrl === 'all-tickets')) {
                newActiveTab = tabFromUrl;
            }
        }

        if (!newActiveTab) {
            if (user?.is_super_admin) {
                newActiveTab = 'all-tickets';
            } else if (user?.is_admin) {
                newActiveTab = 'assigned-active';
            } else {
                newActiveTab = 'my-active';
            }
        }
        
        if (newActiveTab !== activeTab) {
            setActiveTab(newActiveTab);
        }
    }, [location.search, user, activeTab]);

    const getTicketListProps = () => {
        let ticketType = '';
        //@ts-ignore
        let status = [];
        let includeClosedOrResolved = false;
        let requesterId = null;
        let assigneeId = null;

        if (activeTab.startsWith('my-')) {
            ticketType = 'my-tickets';
            requesterId = user?.id; 

            if (activeTab === 'my-active') {
                status = [STATUS_MAP.open, STATUS_MAP.in_progress, STATUS_MAP.waiting_for_user];
            } else if (activeTab === 'my-report') {
                status = [STATUS_MAP.resolved, STATUS_MAP.closed, STATUS_MAP.cancelled];
                includeClosedOrResolved = true; 
            }
        } else if (activeTab.startsWith('assigned-')) {
            ticketType = 'assigned-tickets';
            assigneeId = user?.id; 

            if (activeTab === 'assigned-active') {
                status = [STATUS_MAP.open, STATUS_MAP.in_progress, STATUS_MAP.waiting_for_user];
                includeClosedOrResolved = false;
            } else if (activeTab === 'assigned-report') {
                status = [STATUS_MAP.resolved, STATUS_MAP.closed, STATUS_MAP.cancelled];
                includeClosedOrResolved = true;
            }
        } else if (activeTab === 'all-tickets') {
            ticketType = 'all-tickets';
            status = []; // Quando a tab "all-tickets" for selecionada, não filtramos por status na URL
            includeClosedOrResolved = true; // A rota `/api/tickets/all/` já lida com os status
        }

        return {
            ticketType,
            //@ts-ignore
            status: status,
            includeClosedOrResolved,
            requesterId,
            assigneeId
        };
    };

    const { ticketType, status, includeClosedOrResolved, requesterId, assigneeId } = getTicketListProps();

    return (
        <AnimatedPageWrapper>

        <div className="tickets-page-container">
            {/* O bloco de abas só aparece se a rota for de tickets */}
            {location.pathname === '/tickets/tickets' && (
                <div className="tabs-container0">
                    {/* Abas para Meus Chamados */}
                    {activeTab.startsWith('my-') && (
                        <>
                            <button
                                className={`tab-button ${activeTab === 'my-active' ? 'active' : ''}`}
                                onClick={() => navigate('/tickets/tickets?tab=my-active')}
                            >
                                Chamados Feitos (Ativos)
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'my-report' ? 'active' : ''}`}
                                onClick={() => navigate('/tickets/tickets?tab=my-report')}
                            >
                                Chamados Encerrados
                            </button>
                        </>
                    )}

                    {/* Abas para Chamados Recebidos e Todos os Chamados */}
                    {(activeTab.startsWith('assigned-') || activeTab === 'all-tickets') && (user?.is_admin || user?.is_super_admin) && (
                        <>
                            <button
                                className={`tab-button ${activeTab === 'assigned-active' ? 'active' : ''}`}
                                onClick={() => navigate('/tickets/tickets?tab=assigned-active')}
                            >
                                Chamados Recebidos / Abertos
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'assigned-report' ? 'active' : ''}`}
                                onClick={() => navigate('/tickets/tickets?tab=assigned-report')}
                            >
                                Relatório de Encerrados
                            </button>
                            {user?.is_super_admin && (
                                <button
                                    className={`tab-button ${activeTab === 'all-tickets' ? 'active' : ''}`}
                                    onClick={() => navigate('/tickets/tickets?tab=all-tickets')}
                                >
                                    Todos os Chamados
                                </button>
                            )}
                        </>
                    )}
                </div>
            )}

            <TicketList
                user={user}
                //@ts-ignore
                ticketType={ticketType}
                status={status}
                includeClosedOrResolved={includeClosedOrResolved}
                requesterId={requesterId}
                assigneeId={assigneeId}
            />
        </div>
        </AnimatedPageWrapper>
    );
}

export default TicketsPage;