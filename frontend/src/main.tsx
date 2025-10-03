import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
//@ts-ignore
import './index.css';
import App from './App';
import { AuthProvider } from './components/AUTH/AuthContext';

const rootElement = document.getElementById('root') as HTMLElement;

createRoot(rootElement).render(
  //  <App />
  // <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  // </StrictMode>
);
