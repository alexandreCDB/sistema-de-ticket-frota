import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";

interface User {
  id: number;
  email: string;
  is_admin?: boolean;
  is_super_admin?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // tenta restaurar do cookie
    const savedToken = Cookies.get("token");
    const savedUser = Cookies.get("user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    Cookies.set("token", authToken);
    Cookies.set("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    Cookies.remove("token");
    Cookies.remove("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
};
