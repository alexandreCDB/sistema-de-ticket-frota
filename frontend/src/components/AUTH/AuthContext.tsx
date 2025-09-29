import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

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

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
};
