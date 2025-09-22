import { IUser } from "../../../components/AUTH/interfaces/user";

//@ts-ignore
const API_URL = import.meta.env.VITE_API_URL;


export const fetchUsers = async (): Promise<IUser[]> => {
  const response = await fetch(`${API_URL}/ticket/users/`, {
    credentials: 'include', // envia cookies
  });

  if (!response.ok) {
    throw new Error('Erro ao buscar usuários');
  }

  const data = await response.json();
  return Array.isArray(data) ? data : data.users || [];
};

export const toggleUserActive = async (userId: number, isActive: boolean) => {
  const response = await fetch(`${API_URL}/ticket/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ is_active: !isActive }),
  });

  if (!response.ok) {
    throw new Error('Erro ao atualizar usuário');
  }

  return await response.json();
};
