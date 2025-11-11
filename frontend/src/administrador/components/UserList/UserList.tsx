import React from "react";
import { Wifi, WifiOff, Edit, Trash2, Search } from "lucide-react";
import { UserRow } from "../../types";
import { MdPersonAdd } from "react-icons/md";

interface UserListProps {
    users: UserRow[];
    searchTerm: string;
    onSearch: (term: string) => void;
    onCreate: () => void;
    onEdit: (user: any) => void;
    onResetPassword: (user: any) => void;
    onDeactivate: (user: any) => void;
}

// ✅ Função mais robusta para formatar datas
const formatCnhDate = (dateString: any): string => {
    if (!dateString || dateString === 'null' || dateString === 'undefined') return '-';
    
    try {
        // Converte para string se não for
        const dateStr = String(dateString).trim();
        
        // Se já estiver no formato brasileiro, retorna
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
            return dateStr;
        }
        
        // Se estiver no formato ISO (YYYY-MM-DD) - CORREÇÃO PARA FUSO HORÁRIO
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            const [year, month, day] = dateStr.split('-');
            
            // CORREÇÃO: Adiciona 1 dia para compensar o backend que subtrai
            const correctedDay = parseInt(day) + 1;
            const date = new Date(parseInt(year), parseInt(month) - 1, correctedDay, 12, 0, 0, 0);
            
            const localDay = String(date.getDate()).padStart(2, '0');
            const localMonth = String(date.getMonth() + 1).padStart(2, '0');
            const localYear = date.getFullYear();
            
            console.log('📋 Formatando CNH na lista:', {
                original: dateStr,
                corrected: `${localDay}/${localMonth}/${localYear}`
            });
            
            return `${localDay}/${localMonth}/${localYear}`;
        }
        
        // Tenta parsear como Date se for outro formato
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        }
        
        return dateStr; // Retorna o original se não conseguir formatar
    } catch (error) {
        console.warn('Erro ao formatar data CNH:', dateString, error);
        return String(dateString);
    }
};

const UserList: React.FC<UserListProps> = ({ 
    users, 
    searchTerm, 
    onSearch, 
    onCreate,
    onEdit,
    onResetPassword,
    onDeactivate 
}) => (
    <div className="user-list">
        <div className="user-list-header">
            <div className="search-box">
                <Search className="icon" />
                <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => onSearch(e.target.value)}
                />
            </div>
            <button className="create-user-button" onClick={onCreate}>
                <MdPersonAdd size={20} /> Criar Usuário
            </button>
        </div>
        <div className="table-container">
            <table className="user-table">
                <thead>
                    <tr>
                        <th>Status</th>
                        <th>Usuário</th>
                        <th>Permissão</th>
                        <th>Vencimento CNH</th>
                        <th>Última Sessão</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length > 0 ? (
                        users.map((u) => (
                            <tr key={u.id}>
                                <td data-label="Status">
                                    <span className={`status-badge ${u.status}`}>
                                        {u.status === "online" ? <Wifi /> : <WifiOff />}
                                        {u.status}
                                    </span>
                                </td>
                                <td data-label="Usuário">
                                    <div className="user-info66">
                                        <p className="user-name">{u.name}</p>
                                        <p className="user-email">{u.email}</p>
                                    </div>
                                </td>
                                <td data-label="Permissão">
                                    <span className={`role-tag ${u.role.toLowerCase().replace(" ", "-")}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td data-label="Vencimento CNH">
                                    {formatCnhDate(u.cnh_vencimento)}
                                </td>
                                <td data-label="Última Sessão">{u.lastSeen}</td>
                                <td data-label="Ações">
                                    <div className="actions">
                                        <button className="action-btn edit" onClick={() => onEdit(u)}>
                                            <Edit size={16} /> Editar
                                        </button>
                                        <button className="action-btn reset" onClick={() => onResetPassword(u)}>
                                            <MdPersonAdd size={16} /> Redefinir
                                        </button>
                                        <button
                                            className={`action-btn ${u.is_active ? "deactivate" : "activate"}`}
                                            onClick={() => onDeactivate(u)}
                                        >
                                            <Trash2 size={16} />
                                            {u.is_active ? "Desativar" : "Ativar"}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6} className="no-results">
                                No users found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

export default UserList;