import { useState, FormEvent } from "react";
//@ts-ignore
import teste from "../../assets/logo.png";
import useAuthService from "./AuthForm.service";
import "./AuthForm.css";

interface AuthFormProps {
  onLoginSuccess?: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { message, error, handleLogin, setMessage } = useAuthService();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isRegistering) {
      // Aqui você pode implementar registro no backend futuramente
      if (password !== confirmPassword) {
        setMessage("As senhas não conferem");
        return;
      }
      setMessage("Registro ainda não implementado");
      return;
    }

    await handleLogin(email, password);
    if (onLoginSuccess) onLoginSuccess();
  };

  return (
    <div className="container">
      <div className="auth-container">
        <img className="img-login" src={teste} alt="Logo" />
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="usuario@docebrinquedo.com.br"
            />
          </div>

          <div className="form-group">
            <label>Senha:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="********"
            />
          </div>

          {isRegistering && (
            <div className="form-group">
              <label>Confirmar Senha:</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}

          <button type="submit" className="login-button">
            {isRegistering ? "Registrar" : "Entrar"}
          </button>
        </form>

        {message && <p style={{ color: "green" }}>{message}</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        <p className="registrar">
          {isRegistering ? "Já tem uma conta?" : "Não tem uma conta?"}
          <button
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              marginLeft: "10px",
            }}
          >
            {isRegistering ? "Fazer Login" : "Registrar-se"}
          </button>
        </p>
      </div></div>
  );
};

export default AuthForm;
