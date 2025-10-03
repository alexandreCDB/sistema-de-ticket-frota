// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { connectWebSocket } from "../../services/websocket";

// // @ts-ignore
// const API_URL = import.meta.env.VITE_API_URL;

// export default function useAuthService() {
//   const navigate = useNavigate();
//   const [user, setUser] = useState<any>(null);
//   const [loadingUser, setLoadingUser] = useState(true);
//   const [userError, setUserError] = useState<string | null>(null);
//   const [message, setMessage] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   // 🔹 Buscar usuário autenticado
//   // Esta rota permanece a mesma, pois o /users/me ainda pertence ao módulo de ticket
//   const fetchCurrentUser = async () => {
//     setLoadingUser(true);
//     setUserError(null);
//     try {
//       const res = await fetch(`${API_URL}/ticket/users/me/`, {
//         credentials: "include",
//       });
//       if (!res.ok) throw new Error("Não foi possível carregar usuário");
//       const data = await res.json();
//       setUser(data);
//     } catch {
//       setUser(null);
//       setUserError("Erro ao buscar usuário atual");
//     } finally {
//       setLoadingUser(false);
//     }
//   };

//   // 🔹 Login
//   const handleLogin = async (email: string, password: string) => {
//     setMessage(null);
//     setError(null);

//     try {
//       const body = new URLSearchParams();
//       body.append("username", email);
//       body.append("password", password);

//       // --- CORREÇÃO AQUI ---
//       // A rota de login agora é global, sem o prefixo /ticket
//       const res = await fetch(`${API_URL}/auth/login`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//         },
//         body,
//         credentials: "include",
//       });

//       if (!res.ok) {
//         const data = await res.json();
//         throw new Error(data.detail || "Erro no login");
//       }
//       const data = await res.json();
//       console.log('Login response data:', data); // Verifique a resposta do login
      
//       const token = data.access_token;
//       const user_e = data.user_e;
//       localStorage.setItem("token", token);
//       localStorage.setItem("user_current", user_e);
      
//       connectWebSocket(token);

//       setMessage("Login bem-sucedido!");
//       await fetchCurrentUser();
//       navigate("/", { replace: true });
//     } catch (err: any) {
//       setError((err as Error).message || "Erro na autenticação");
//     }
//   };

//   // 🔹 Logout
//   const handleLogout = async () => {
//     try {
//       // --- CORREÇÃO AQUI ---
//       // A rota de logout agora é global, sem o prefixo /ticket
//       await fetch(`${API_URL}/auth/logout`, {
//         method: "POST",
//         credentials: "include",
//       });
//     } finally {
//       setUser(null);
//       // Redireciona para a página de login após o logout
//       navigate("/login", { replace: true });
//     }
//   };

//   useEffect(() => {
//     // Busca o usuário atual quando o serviço é inicializado
//     fetchCurrentUser();
//   }, []);

//   // useAuthService.ts
// // ...

// const handleRegister = async (email: string, password: string, confirmPassword: string) => {
//   setMessage(null);
//   setError(null);

//   if (password !== confirmPassword) {
//     setError("As senhas não conferem");
//     return;
//   }

//   try {
//     const res = await fetch(`${API_URL}/ticket/users`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         email,
//         password,
//       }),
//     });

//     if (!res.ok) {
//       const data = await res.json();
//       throw new Error(data.detail || "Erro ao registrar usuário");
//     }

//     setMessage("Usuário registrado com sucesso! Agora faça login.");
//   } catch (err: any) {
//     setError(err.message || "Erro no registro");
//   }
// };

//   return {
//     user,
//     loadingUser,
//     userError,
//     message,
//     error,
//     handleLogin,
//     handleLogout,
//     handleRegister,
//     setMessage,
//     setError,
//   };
// }