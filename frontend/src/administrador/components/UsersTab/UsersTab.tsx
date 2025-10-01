import React, { useEffect, useState } from "react";
import UserList from "./../UserList/UserList";
import { fetchUsers, toggleUserActive, useDashboardStats } from "../../pages/main/AdminDashboard.service";
import { IUser } from "../../../components/AUTH/interfaces/user";
import UserModal from "../modal/UserModal";
import PasswordResetModal from "../modal/PasswordResetModal";
import ConfirmModal from "../modal/ConfirmModal";
import { UserRow } from "../../types";



const UsersTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [allUsers, setAllUsers] = useState<IUser[]>([]);
  const { users: wsUsers } = useDashboardStats(); // usuários do WS, com status


  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const loadUsers = async () => {
    const users = await fetchUsers();
    setAllUsers(users);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Combina usuários da API com status do WS
  // const combinedUsers = allUsers.map(user => {
  //   const wsUser = wsUsers.find(u => u.id === user.id);
  //   return {
  //     id: user.id,
  //     name: user.email.split("@")[0], // ou outro campo se tiver name
  //     email: user.email,
  //     status: wsUser ? "online" : "offline",
  //     role: user.is_super_admin ? "Super Admin" : user.is_admin ? "Admin" : "User",
  //     lastSeen: user.lastSeen ? new Date(user.lastSeen).toLocaleString() : "-"
  //   };
  // });
  const combinedUsers: UserRow[] = allUsers.map(user => {
    const wsUser = wsUsers.find(u => u.id === user.id); // pega status online do WS
    return {
      id: user.id,
      name: user.email.split("@")[0].replace(/\./g, " "), // ou user.name se tiver
      email: user.email,
      status: wsUser ? "online" : "offline",
      role: user.is_super_admin ? "Super Admin" : user.is_admin ? "Admin" : "User",
      lastSeen: user.lastSeen ? new Date(user.lastSeen).toLocaleString() : "-",
      is_active: user.is_active
    };
  });
  
  
  const filteredAndSortedUsers = combinedUsers
    .filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // usuários online e ativos no topo
      const scoreA = (a.status === "online" ? 1 : 0) + (a.is_active ? 1 : 0);
      const scoreB = (b.status === "online" ? 1 : 0) + (b.is_active ? 1 : 0);
      return scoreB - scoreA;
    });


  const handleCreate = () => {
    setSelectedUser(null);
    setShowUserModal(true);
  };

  const handleEdit = (user: IUser) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleResetPassword = (user: IUser) => {
    setSelectedUser(user);
    setShowPasswordModal(true);
  };

  const handleDeactivate = (user: IUser) => {
    setSelectedUser(user);
    setShowConfirmModal(true);
  };

  const confirmDeactivate = async () => {
    if (!selectedUser) return;
    await toggleUserActive(selectedUser.id, selectedUser.is_active);
    loadUsers();
    setShowConfirmModal(false);
  };

  return (
    <>

      <UserList
        users={filteredAndSortedUsers} // aqui entra o combinedUsers já filtrado e ordenado
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onResetPassword={handleResetPassword}
        onDeactivate={handleDeactivate}
      />
      {showUserModal && (
        <UserModal
          user={selectedUser}
          onClose={() => setShowUserModal(false)}
          onSuccess={loadUsers}
        />
      )}

      {showPasswordModal && selectedUser && (
        <PasswordResetModal
          user={selectedUser}
          onClose={() => setShowPasswordModal(false)}
        />
      )}

      {showConfirmModal && selectedUser && (
        <ConfirmModal
          user={selectedUser}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={confirmDeactivate}
        />
      )}

    </>
  );
};

export default UsersTab;

// import React, { useEffect, useState } from "react";
// import UserList from "./../UserList/UserList";
// import { fetchUsers } from "../../pages/main/AdminDashboard.service";
// // import { useUsers } from "../../hooks/useUsers";

// const UsersTab: React.FC = () => {
//   // const { users } = useUsers();
//   const [searchTerm, setSearchTerm] = useState("");
//   const [allUsers, setAllUsers] = useState([]);

//   useEffect(() => {
//     const loadUsers = async () => {
//       const users = await fetchUsers();
//       setAllUsers(users);
//     };
//     loadUsers();
//   }, []);

//   return <UserList users={allUsers} searchTerm={searchTerm} onSearch={setSearchTerm} />;
// };

// export default UsersTab;
