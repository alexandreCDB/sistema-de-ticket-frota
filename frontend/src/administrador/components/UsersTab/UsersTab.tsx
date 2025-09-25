import React, { useState } from "react";
import UserList from "./../UserList/UserList";
import { useUsers } from "../../hooks/useUsers";

const UsersTab: React.FC = () => {
  const { users } = useUsers();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return <UserList users={filteredUsers} searchTerm={searchTerm} onSearch={setSearchTerm} />;
};

export default UsersTab;
