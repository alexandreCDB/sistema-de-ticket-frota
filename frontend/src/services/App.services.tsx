import { useEffect, useState } from 'react';

//@ts-ignore
const API_URL = import.meta.env.VITE_API_URL;

interface AuthParams {
  email: string;
  password: string;
  confirmPassword?: string;
  isRegistering: boolean;
  onLoginSuccess?: () => void;
}

export default function useAuthService() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async ({ email, password, confirmPassword, isRegistering, onLoginSuccess }: AuthParams) => {
    setMessage(null);
    setError(null);

    try {
      if (isRegistering) {
        await fetch(`${API_URL}/ticket/auth/register/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, confirmPassword }),
        });
        setMessage('Conta criada com sucesso! Faça login.');
      } else {
        const response = await fetch(`${API_URL}/ticket/auth/login/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          credentials: 'include',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || 'Erro no login');
        }

        onLoginSuccess?.();
      }
    } catch (err: any) {
      setError(err.message || 'Erro na autenticação');
    }
  };

  return { message, error, handleAuth, setMessage };
}

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const fetchCurrentUser = async () => {
    setLoadingUser(true);
    setUserError(null);
    try {
      const res = await fetch(`${API_URL}/ticket/users/me/`, {
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Não foi possível carregar usuário');
      
      const data = await res.json();
      setUser(data);

      const authHeader = res.headers.get("Authorization");
      if (authHeader?.startsWith("Bearer ")) {
        setToken(authHeader.replace("Bearer ", ""));
      }

    } catch (err) {
      setUser(null);
      setUserError('Erro ao buscar usuário atual');
    } finally {
      setLoadingUser(false);
    }
  };

  const handleLoginSuccess = async () => {
    await fetchCurrentUser();
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/ticket/auth/logout/`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setUser(null);
      window.location.href = '/login';
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  return { user, loadingUser, userError, handleLoginSuccess, handleLogout, token };
}