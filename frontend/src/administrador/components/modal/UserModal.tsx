import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import {
  AlertTriangle,
  Calendar,
  X,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { IUser } from '../../../components/AUTH/interfaces/user';
import { saveCnhVencimento } from '../../pages/main/AdminDashboard.service';
import './UserModal.css';
import 'react-datepicker/dist/react-datepicker.css';

const API_URL = import.meta.env.VITE_API_URL;

interface Props {
  user: IUser | null;
  onClose: () => void;
  onSuccess: () => void;
}

const UserModal = ({ user, onClose, onSuccess }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cnhDate, setCnhDate] = useState<Date | null>(null);
  const [role, setRole] = useState('comum');

  // ✅ CORREÇÃO: Sempre carrega o papel correto do usuário baseado na propriedade 'role'
  useEffect(() => {
    if (user) {
      console.log('🔍 DEBUG - Objeto user COMPLETO:', JSON.stringify(user, null, 2));
      
      setEmail(user.email);
      setError(null);

      // ✅ CORREÇÃO CRÍTICA: Determina o role baseado na propriedade 'role' do usuário
      let userRole = 'comum';
      
      if (user.role) {
        const roleLower = user.role.toLowerCase();
        if (roleLower.includes('super')) {
          userRole = 'is_super_admin';
        } else if (roleLower.includes('admin')) {
          userRole = 'is_admin';
        }
      }
      
      // ✅ CORREÇÃO ALTERNATIVA: Também verifica as propriedades booleanas se existirem
      if (user.is_super_admin === true || user.is_super_admin === 'true') {
        userRole = 'is_super_admin';
      } else if (user.is_admin === true || user.is_admin === 'true') {
        userRole = 'is_admin';
      }
      
      console.log('🔄 Carregando perfil do usuário:', {
        email: user.email,
        role: user.role,
        is_super_admin: user.is_super_admin,
        is_admin: user.is_admin,
        roleDefinido: userRole
      });
      
      setRole(userRole);

      // ✅ Converte string 'AAAA-MM-DD' em data local CORRETAMENTE
      const cnhString = user.cnh_vencimento?.trim();
      console.log('🔄 Carregando CNH do usuário:', { cnhString, user });
      
      if (cnhString && /^\d{4}-\d{2}-\d{2}$/.test(cnhString)) {
        const [y, m, d] = cnhString.split('-').map(Number);
        // CORREÇÃO: Adiciona 1 dia para compensar o backend que subtrai
        const correctedDate = new Date(y, m - 1, d + 1, 12, 0, 0, 0);
        console.log('📅 Data convertida (com correção):', { 
          original: cnhString, 
          correctedDate: correctedDate.toLocaleDateString('pt-BR'),
          dayOriginal: d,
          dayCorrected: d + 1
        });
        setCnhDate(correctedDate);
      } else if (cnhString && cnhString.includes('/')) {
        // Se veio no formato DD/MM/YYYY (já corrigido pelo backend)
        const [d, m, y] = cnhString.split('/').map(Number);
        const localDate = new Date(y, m - 1, d, 12, 0, 0, 0);
        console.log('📅 Data em formato brasileiro:', { original: cnhString, localDate: localDate.toLocaleDateString('pt-BR') });
        setCnhDate(localDate);
      } else {
        setCnhDate(null);
      }
    } else {
      // Reset para novo usuário
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setRole('comum');
      setCnhDate(null);
    }
  }, [user]);

  // ✅ Mantém a data selecionada
  const handleCnhDateChange = (date: Date | null) => {
    console.log('📅 Data selecionada no picker:', date?.toLocaleDateString('pt-BR'));
    setCnhDate(date);
  };

  // ✅ CORREÇÃO CRÍTICA: Compensa a subtração do backend
  const formatDateForAPI = (date: Date | null): string | null => {
    if (!date) return null;
    
    // CORREÇÃO: Adiciona 1 dia para compensar o backend que subtrai
    const correctedDate = new Date(date);
    correctedDate.setDate(correctedDate.getDate() + 1);
    
    const year = correctedDate.getFullYear();
    const month = String(correctedDate.getMonth() + 1).padStart(2, '0');
    const day = String(correctedDate.getDate()).padStart(2, '0');
    
    const formatted = `${year}-${month}-${day}`;
    console.log('📤 Data formatada para API (COM CORREÇÃO):', { 
      original: date.toLocaleDateString('pt-BR'),
      corrected: correctedDate.toLocaleDateString('pt-BR'),
      enviando: formatted
    });
    
    return formatted;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const isSuperAdmin = role === 'is_super_admin';
    const isAdmin = isSuperAdmin || role === 'is_admin';

    const payload: any = {
      email,
      is_admin: isAdmin,
      is_super_admin: isSuperAdmin,
    };

    const cnhVencimentoString = formatDateForAPI(cnhDate);
    console.log('💾 ENVIANDO PARA BACKEND (COM CORREÇÃO):', { 
      cnhDate: cnhDate?.toLocaleDateString('pt-BR'),
      cnhVencimentoString,
      payload 
    });

    try {
      if (user) {
        // Atualiza usuário existente
        const res = await fetch(`${API_URL}/ticket/users/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
        
        if (!res.ok) throw new Error('Falha ao atualizar usuário.');

        console.log('🎯 Enviando CNH para saveCnhVencimento (COM CORREÇÃO):', {
          userId: user.id,
          cnhVencimento: cnhVencimentoString
        });
        
        await saveCnhVencimento(user.id, cnhVencimentoString);
      } else {
        if (password !== confirmPassword) {
          throw new Error('As senhas não coincidem!');
        }

        await fetch(`${API_URL}/ticket/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ ...payload, password }),
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="umodal-overlay">
      <div className="umodal">
        <div className="umodal-header">
          <h3>{user ? 'Editar Usuário' : 'Criar Usuário'}</h3>
          <button type="button" onClick={onClose} disabled={isLoading} className="umodal-close-button">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={!!user}
            required
          />

          {!user && (
            <>
              <label>Senha:</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <label>Confirmar Senha:</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </>
          )}

          <label>Tipo de usuário:</label>
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="comum">Comum</option>
            <option value="is_admin">Admin</option>
            <option value="is_super_admin">Super Admin</option>
          </select>

          {user && (
            <div className="form-group-date">
              <label><Calendar size={18} style={{ marginRight: '6px' }} />Vencimento da CNH:</label>
              <DatePicker
                selected={cnhDate}
                onChange={handleCnhDateChange}
                dateFormat="dd/MM/yyyy"
                className="umodal-input-date"
                placeholderText="dd/mm/aaaa"
                autoComplete="off"
                isClearable
                renderCustomHeader={({ date, decreaseMonth, increaseMonth, decreaseYear, increaseYear }) => (
                  <div className="datepicker-header">
                    <button onClick={decreaseMonth} type="button"><ChevronLeft size={18} /></button>
                    <span>
                      {date.toLocaleString('default', { month: 'long' })} {date.getFullYear()}
                    </span>
                    <button onClick={increaseMonth} type="button"><ChevronRight size={18} /></button>
                  </div>
                )}
              />
            </div>
          )}

          {error && (
            <div className="umodal-error-box">
              <AlertTriangle size={20} /> {error}
            </div>
          )}

          <div className="umodal-actions">
            <button type="button" onClick={onClose} disabled={isLoading}>Cancelar</button>
            <button type="submit" disabled={isLoading} className="umodal-save-button">
              Salvar <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;