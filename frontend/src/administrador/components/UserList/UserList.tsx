import React from "react";
import { Wifi, WifiOff, Edit, Trash2, Plus, Search } from "lucide-react";
import { User, UserRow } from "../../types";
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

const UserList: React.FC<UserListProps> = ({ users, searchTerm, onSearch, onCreate,
  onEdit,
  onResetPassword,
  onDeactivate }) => (
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
      <table>
        <thead>
          <tr>
            <th>Status</th>
            <th>Usuário</th>
            <th>Permissão</th>
            <th>Útima Sessão</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((u) => (
              <tr key={u.id}>
                <td>
                  <span className={`status-badge ${u.status}`}>
                    {u.status === "online" ? <Wifi /> : <WifiOff />}
                    {u.status}
                  </span>
                </td>
                <td>
                  <p className="user-name">{u.name}</p>
                  <p className="user-email">{u.email}</p>
                </td>
                <td>
                  <span className={`role-tag ${u.role.toLowerCase().replace(" ", "-")}`}>
                    {u.role}
                  </span>
                </td>
                <td>{u.lastSeen}</td>
                <td className="actions">
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
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="no-results">
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
