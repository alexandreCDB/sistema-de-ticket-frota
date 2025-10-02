// import React from "react";
// import { Navigate, Outlet } from "react-router-dom";
// import { useAuth } from "../components/AUTH/AuthContext";
// import Loading from "../components/Loads/Loading";

// const ProtectedRoute: React.FC = () => {
//   const { user, loadingUser } = useAuth();
  
//   // Enquanto verifica o utilizador, mostra uma mensagem
//   if (loadingUser) {
//     return <Loading />;
//   }

//   // Se a verificação terminou e não há utilizador, redireciona para o login
//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }
  
//   // Se há utilizador, permite o acesso às rotas filhas
//   return <Outlet />; 
// };

// export default ProtectedRoute;