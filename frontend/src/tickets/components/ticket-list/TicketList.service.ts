//@ts-ignore
const API_URL = import.meta.env.VITE_API_URL;

export interface TicketParams {
    ticketType: 'my-tickets' | 'assigned-tickets' | 'all-tickets';
    status?: string[];
    includeClosedOrResolved?: boolean;
    skip?: number;
    limit?: number;
}

export interface TicketResponse<T = any> {
    items: T[];
    total_tickets: number;
}

export const fetchTickets = async (params: TicketParams): Promise<TicketResponse> => {
    let endpoint = '';
    const query = new URLSearchParams();

    const skip = params.skip ?? 0;
    const limit = params.limit ?? 10;

    query.append('skip', String(skip));
    query.append('limit', String(limit));

    if (params.ticketType === 'my-tickets') {
        endpoint = '/ticket/tickets/my-tickets/';
        params.status?.forEach(s => query.append('status', s));
    } else if (params.ticketType === 'assigned-tickets') {
        endpoint = '/ticket/tickets/assigned-to-me-or-unassigned/';
        params.status?.forEach(s => query.append('status', s));
        if (params.includeClosedOrResolved) query.append('include_closed_or_resolved', 'true');
    } else if (params.ticketType === 'all-tickets') {
        endpoint = '/ticket/tickets/all/';
        params.status?.forEach(s => query.append('status', s));
        if (params.includeClosedOrResolved) query.append('include_closed_or_resolved', 'true');
    } else {
        throw new Error('Tipo de ticket inválido');
    }

    const url = `${API_URL}${endpoint}${query.toString() ? `?${query.toString()}` : ''}`;

    const response = await fetch(url, {
        // headers: { Authorization: `Bearer ${token}` },
        credentials: 'include', // usa cookie
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao buscar tickets');
    }

    return await response.json();
};
