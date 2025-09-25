import React from "react";
import { Wifi, WifiOff, Edit, Trash2, Plus, Search } from "lucide-react";
import { User } from "../../types";

interface UserListProps {
  users: User[];
  searchTerm: string;
  onSearch: (term: string) => void;
}

const UserList: React.FC<UserListProps> = ({ users, searchTerm, onSearch }) => (
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
      <button className="button primary">
        <Plus className="icon" />
        New User
      </button>
    </div>

    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Status</th>
            <th>User</th>
            <th>Role</th>
            <th>Last Activity</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.id}>
                <td>
                  <span className={`status-badge ${user.status}`}>
                    {user.status === "online" ? <Wifi /> : <WifiOff />}
                    {user.status}
                  </span>
                </td>
                <td>
                  <p className="user-name">{user.name}</p>
                  <p className="user-email">{user.email}</p>
                </td>
                <td>
                  <span className={`role-tag ${user.role.toLowerCase()}`}>{user.role}</span>
                </td>
                <td>{user.lastSeen}</td>
                <td className="actions">
                  <button className="icon-button edit">
                    <Edit />
                  </button>
                  <button className="icon-button delete">
                    <Trash2 />
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
