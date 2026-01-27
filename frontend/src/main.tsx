import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
//@ts-ignore
import './index.css';
import App from './App';
import { AuthProvider } from './components/AUTH/AuthContext';
import { BrowserRouter as Router } from 'react-router-dom';

const rootElement = document.getElementById('root') as HTMLElement;

createRoot(rootElement).render(
  //  <App />
  // <StrictMode>
  <Router>
    <AuthProvider>
      <App />
    </AuthProvider>
  </Router>
  // </StrictMode>
);
