
interface UserRow {
  id: number;
  name: string;
  email: string;
  status: "online" | "offline";
  role: string;
  lastSeen: string;
  is_active: boolean;
}

// Dentro do componente
const combinedUsers: UserRow[] = allUsers.map(user => {
  const wsUser = wsUsers.find(u => u.id === user.id); // pega status online do WS
  return {
    id: user.id,
    name: user.email.split("@")[0], // ou user.name se tiver
    email: user.email,
    status: wsUser ? "online" : "offline",
    role: user.is_super_admin ? "Super Admin" : user.is_admin ? "Admin" : "User",
    lastSeen: user.lastSeen ? new Date(user.lastSeen).toLocaleString() : "-",
    is_active: user.is_active
  };
});
