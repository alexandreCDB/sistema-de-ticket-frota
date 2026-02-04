import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { IUser } from "./interfaces/user";
import { useNavigate } from "react-router-dom";
import { connectWebSocket, disconnectWebSocket } from "../../services/websocket";

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
  fetchCurrentUser: () => Promise<IUser | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// @ts-ignore
const API_URL = import.meta.env.VITE_API_URL;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [loadingUser, setLoadingUser] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const clearAuth = useCallback(() => {
    disconnectWebSocket();
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user_current");
  }, []);

  const fetchCurrentUser = useCallback(async (): Promise<IUser | null> => {
    const tokenLocal = localStorage.getItem("token");

    // Se não há token, não adianta tentar buscar o usuário e causar um 401
    if (!tokenLocal) {
      setLoadingUser(false);
      setUser(null);
      return null;
    }

    setLoadingUser(true);
    try {
      const res = await fetch(`${API_URL}/ticket/users/me/`, {
        headers: {
          "Authorization": `Bearer ${tokenLocal}`,
        },
        credentials: "include",
      });

      if (res.status === 401) {
        // Token inválido ou expirado - Limpa tudo
        clearAuth();
        throw new Error("Sessão expirada");
      }

      if (!res.ok) throw new Error("Não foi possível carregar usuário");

      const data = await res.json();
      setUser(data);
      return data as IUser;
    } catch (err) {
      console.error("Erro ao buscar usuário atual:", err);
      setUser(null);
      return null;
    } finally {
      setLoadingUser(false);
    }
  }, [clearAuth]);

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
      const user_email = data.user_e;

      setToken(accessToken);
      localStorage.setItem("token", accessToken);
      localStorage.setItem("user_current", user_email);
      sessionStorage.setItem("authEmail", email);
      sessionStorage.setItem("authPassword", password)
      connectWebSocket(accessToken);
      setMessage("Login bem-sucedido!");

      await fetchCurrentUser();
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err.message || "Erro na autenticação");
    }
  };

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

  const logout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Erro no logout", err);
    } finally {
      clearAuth();
      // navigate("/login", { replace: true });
      window.location.href = "/login";
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

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
        fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
};

// Mantemos o alias para compatibilidade se algum arquivo ainda usar, 
// mas todos devem migrar para useAuth
export const useAuth_old = useAuth;
export const useAuthS = useAuth;

export default function useAuthService() {
  const { message, error, setMessage, setError, login, register } = useAuth();

  const handleAuth = async ({ email, password, confirmPassword, isRegistering }: any) => {
    if (isRegistering) {
      await register(email, password, confirmPassword);
    } else {
      await login(email, password);
    }
  };

  return { message, error, handleAuth, setMessage };
}
