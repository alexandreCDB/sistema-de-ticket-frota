import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import Loading from '../../components/Loads/Loading';

interface ProtectedRouteProps {
  user: any | null; // você pode tipar melhor conforme seu modelo de usuário
  loadingUser: boolean;
  userError: string | null;
  children: ReactNode;
}

const ProtectedRoutec: React.FC<ProtectedRouteProps> = ({ user, loadingUser, userError, children }) => {  
  if (loadingUser) return <Loading />;
  if (userError) return <p style={{ color: 'red' }}>{userError}</p>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default ProtectedRoutec;