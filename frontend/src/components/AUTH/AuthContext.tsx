import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { IUser } from "./interfaces/user";
import { useNavigate } from "react-router-dom";
import { connectWebSocket } from "../../services/websocket";

interface User {
  id: number;
  email: string;
  is_admin?: boolean;
  is_super_admin?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loadingUser: boolean;
  message: string | null;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  setMessage: (msg: string | null) => void;
  setError: (err: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// @ts-ignore
const API_URL = import.meta.env.VITE_API_URL;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Busca usuário logado (se tiver sessão ativa no backend)
  const fetchCurrentUser = async () => {
    setLoadingUser(true);
    try {
      const res = await fetch(`${API_URL}/ticket/users/me/`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Não foi possível carregar usuário");
      const data = await res.json();
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  // 🔹 Login
  const login = async (email: string, password: string) => {
    setMessage(null);
    setError(null);
    try {
      const body = new URLSearchParams();
      body.append("username", email);
      body.append("password", password);

      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Erro no login");
      }

      const data = await res.json();
      const accessToken = data.access_token;
      const user_e = data.user_e;
      setToken(accessToken);
      localStorage.setItem("token", accessToken);
      localStorage.setItem("user_current", user_e);

      setMessage("Login bem-sucedido!");
      await fetchCurrentUser();
    } catch (err: any) {
      setError(err.message || "Erro na autenticação");
    }
  };

  // 🔹 Registrar
  const register = async (
    email: string,
    password: string,
    confirmPassword: string
  ) => {
    setMessage(null);
    setError(null);

    if (password !== confirmPassword) {
      setError("As senhas não conferem");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/ticket/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Erro ao registrar usuário");
      }

      setMessage("Usuário registrado com sucesso! Agora faça login.");
    } catch (err: any) {
      setError(err.message || "Erro no registro");
    }
  };

  // 🔹 Logout
  const logout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Erro no logout", err);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loadingUser,
        message,
        error,
        login,
        register,
        logout,
        setMessage,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth_old = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
};

interface AuthParams {
  email: string;
  password: string;
  confirmPassword?: string;
  isRegistering: boolean;
  onLoginSuccess?: () => void; // já que o cookie é gerenciado pelo backend
}

export default function useAuthService() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async ({ email, password, confirmPassword, isRegistering, onLoginSuccess }: AuthParams) => {
    setMessage(null);
    setError(null);

    try {
      if (isRegistering) {
        // Registro
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

        onLoginSuccess?.(); // dispara redirecionamento no App
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

  // Função para buscar usuário atual
  const fetchCurrentUser = async () => {
    setLoadingUser(true);
    setUserError(null);
    let userData: IUser | null = null;

    try {
      const res = await fetch(`${API_URL}/ticket/users/me/`, {
        credentials: 'include',
      });


      if (!res.ok) throw new Error('Não foi possível carregar usuário');
      const data = await res.json();
      setUser(data);
      userData = data as IUser
    } catch (err) {
      setUser(null);
      setUserError('Erro ao buscar usuário atual');
    } finally {
      setLoadingUser(false);
      return userData;
    }
  };

  const returnUserCurrent = async () => {

    let userData: IUser | null = null;

    try {
      const res = await fetch(`${API_URL}/ticket/users/me/`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Não foi possível carregar usuário');
      const data = await res.json();
      userData = data as IUser
    } catch (err) {
      throw new Error('returnUserCurrent: Erro ao buscar usuário atual');
    } finally {
      return userData;
    }
  };

  // 🔹 handleLoginSuccess: chamado pelo AuthForm
  const handleLoginSuccess = async () => {
    // Após login, busca dados do usuário
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

  return { user, loadingUser, userError, handleLoginSuccess, handleLogout };
}


export function useAuthS() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Buscar usuário autenticado
  // Esta rota permanece a mesma, pois o /users/me ainda pertence ao módulo de ticket
  const fetchCurrentUser = async () => {
    setLoadingUser(true);
    setUserError(null);
    try {
      const res = await fetch(`${API_URL}/ticket/users/me/`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Não foi possível carregar usuário");
      const data = await res.json();
      setUser(data);
    } catch {
      setUser(null);
      setUserError("Erro ao buscar usuário atual");
    } finally {
      setLoadingUser(false);
    }
  };

  // 🔹 Login
  const handleLogin = async (email: string, password: string) => {
    setMessage(null);
    setError(null);

    try {
      const body = new URLSearchParams();
      body.append("username", email);
      body.append("password", password);

      // --- CORREÇÃO AQUI ---
      // A rota de login agora é global, sem o prefixo /ticket
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Erro no login");
      }
      const data = await res.json();
      console.log('Login response data:', data); // Verifique a resposta do login

      const token = data.access_token;
      const user_e = data.user_e;
      localStorage.setItem("token", token);
      localStorage.setItem("user_current", user_e);

      connectWebSocket(token);

      setMessage("Login bem-sucedido!");
      await fetchCurrentUser();
      navigate("/", { replace: true });
    } catch (err: any) {
      setError((err as Error).message || "Erro na autenticação");
    }
  };

  // 🔹 Logout
  const handleLogout = async () => {
    try {
      // --- CORREÇÃO AQUI ---
      // A rota de logout agora é global, sem o prefixo /ticket
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setUser(null);
      // Redireciona para a página de login após o logout
      navigate("/login", { replace: true });
    }
  };

  useEffect(() => {
    // Busca o usuário atual quando o serviço é inicializado
    fetchCurrentUser();
  }, []);

  // useAuthService.ts
  // ...

  const handleRegister = async (email: string, password: string, confirmPassword: string) => {
    setMessage(null);
    setError(null);

    if (password !== confirmPassword) {
      setError("As senhas não conferem");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/ticket/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Erro ao registrar usuário");
      }

      setMessage("Usuário registrado com sucesso! Agora faça login.");
    } catch (err: any) {
      setError(err.message || "Erro no registro");
    }
  };

  return {
    user,
    loadingUser,
    userError,
    message,
    error,
    handleLogin,
    handleLogout,
    handleRegister,
    setMessage,
    setError,
  };
}