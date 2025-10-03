// import { useEffect, useState } from 'react';
// import { IUser } from '../../components/AUTH/interfaces/user';
// //@ts-ignore
// const API_URL = import.meta.env.VITE_API_URL;

// interface AuthParams {
//   email: string;
//   password: string;
//   confirmPassword?: string;
//   isRegistering: boolean;
//   onLoginSuccess?: () => void; // já que o cookie é gerenciado pelo backend
// }

// export default function useAuthService() {
//   const [message, setMessage] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   const handleAuth = async ({ email, password, confirmPassword, isRegistering, onLoginSuccess }: AuthParams) => {
//     setMessage(null);
//     setError(null);

//     try {
//       if (isRegistering) {
//         // Registro
//         await fetch(`${API_URL}/ticket/auth/register/`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ email, password, confirmPassword }),
//         });
//         setMessage('Conta criada com sucesso! Faça login.');
//       } else {
        
//         const response = await fetch(`${API_URL}/ticket/auth/login/`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ email, password }),
//           credentials: 'include', 
//         });

//         if (!response.ok) {
//           const data = await response.json();
//           throw new Error(data.detail || 'Erro no login');
//         }

//         onLoginSuccess?.(); // dispara redirecionamento no App
//       }
//     } catch (err: any) {
//       setError(err.message || 'Erro na autenticação');
//     }
//   };

//   return { message, error, handleAuth, setMessage };
// }


// export function useAuth() {
//   const [user, setUser] = useState<any>(null);
//   const [loadingUser, setLoadingUser] = useState(true);
//   const [userError, setUserError] = useState<string | null>(null);

//   // Função para buscar usuário atual
//   const fetchCurrentUser = async () => {
//     setLoadingUser(true);
//     setUserError(null);
//     let userData: IUser | null = null;

//     try {
//       const res = await fetch(`${API_URL}/ticket/users/me/`, {
//         credentials: 'include',
//       });
      
      
//       if (!res.ok) throw new Error('Não foi possível carregar usuário');
//       const data = await res.json();
//       setUser(data);
//       userData = data as IUser
//     } catch (err) {
//       setUser(null);
//       setUserError('Erro ao buscar usuário atual');
//     } finally {
//       setLoadingUser(false);
//       return userData;
//     }
//   };

//    const returnUserCurrent = async () => {
  
//     let userData: IUser | null = null;

//     try {
//       const res = await fetch(`${API_URL}/ticket/users/me/`, {
//         credentials: 'include',
//       });           
//       if (!res.ok) throw new Error('Não foi possível carregar usuário');
//       const data = await res.json();     
//       userData = data as IUser
//     } catch (err) {
//       throw new Error('returnUserCurrent: Erro ao buscar usuário atual');
//     } finally {
//       return userData;
//     }
//   };

//   // 🔹 handleLoginSuccess: chamado pelo AuthForm
//   const handleLoginSuccess = async () => {
//     // Após login, busca dados do usuário
//     await fetchCurrentUser();
//   };

//   const handleLogout = async () => {
//     try {
//       await fetch(`${API_URL}/ticket/auth/logout/`, {
//         method: 'POST',
//         credentials: 'include',
//       });
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setUser(null);
//       window.location.href = '/login';
//     }
//   };

//   useEffect(() => {
//     fetchCurrentUser();
//   }, []);

//   return { user, loadingUser, userError, handleLoginSuccess, handleLogout };
// }




// import { useState, useEffect } from 'react';
// //@ts-ignore
// const API_URL = import.meta.env.VITE_API_URL;

// export function useAuth() {
//   const [user, setUser] = useState(null);
//   const [loadingUser, setLoadingUser] = useState(true);
//   const [userError, setUserError] = useState<string | null>(null);

//   const fetchCurrentUser = async () => {
//     setLoadingUser(true);
//     setUserError(null);
           
//     try {
//       const response = await fetch(`${API_URL}/ticket/users/me/`, {
//         credentials: 'include', 
//       });

//       if (!response.ok) {
//         setUser(null);
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const userData = await response.json();
//       setUser(userData);
//     } catch (err) {
//       console.error("Erro ao buscar usuário atual:", err);
//       setUserError("Não foi possível carregar dados do usuário.");
//     } finally {
//       setLoadingUser(false);
//     }
//   };

//   useEffect(() => {
//     fetchCurrentUser();
//   }, []);

//   const handleLogout = async () => {
//     try {
//       await fetch(`${API_URL}/ticket/auth/logout/`, {
//         method: 'POST',
//         credentials: 'include', // importante: remove cookie via backend
//       });
//     } catch (err) {
//       console.error("Erro ao fazer logout:", err);
//     } finally {
//       setUser(null);
//       window.location.href = '/login';
//     }
//   };

//   return {
//     user,
//     loadingUser,
//     userError,
//     fetchCurrentUser,
//     handleLogout
//   };
// }
