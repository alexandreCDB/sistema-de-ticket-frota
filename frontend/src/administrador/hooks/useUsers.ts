import { useState } from "react";
import { User } from "../types";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: "João Silva", email: "joao@email.com", status: "online", lastSeen: "Now", role: "Admin" },
    { id: 2, name: "Maria Santos", email: "maria@email.com", status: "online", lastSeen: "Now", role: "User" },
    { id: 3, name: "Pedro Costa", email: "pedro@email.com", status: "offline", lastSeen: "5 min ago", role: "User" },
    { id: 4, name: "Ana Oliveira", email: "ana@email.com", status: "online", lastSeen: "Now", role: "Moderator" },
  ]);

  const toggleStatus = (id: number) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === "online" ? "offline" : "online" } : u))
    );
  };

  const addUser = (user: User) => setUsers((prev) => [...prev, user]);

  const removeUser = (id: number) => setUsers((prev) => prev.filter((u) => u.id !== id));

  return { users, setUsers, toggleStatus, addUser, removeUser };
}
