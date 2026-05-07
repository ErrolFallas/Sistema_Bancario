import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToastContext } from '../context/ToastContext';
import '../css/login.css';
import '../css/forms.css';

/**
 * Login — Página de acceso seguro
 * Refactorizado: usa toast para errores, prevención doble submit.
 */
const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const toast = useToastContext();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return; // Prevención doble submit

    try {
      if (!username.trim()) {
        toast.warning('El nombre de usuario es obligatorio.');
        return;
      }
      if (!password) {
        toast.warning('La contraseña es obligatoria.');
        return;
      }
      if (username.trim().length < 3) {
        toast.warning('El usuario debe tener al menos 3 caracteres.');
        return;
      }

      setIsLoading(true);
      await login({ username: username.trim(), password });
      toast.success('Sesión iniciada correctamente.');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '2.5rem' }}>🏦</div>
        <h2>Acceso Seguro</h2>
        <p className="login-subtitle">Ingresa tus credenciales para continuar</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-username">Usuario</label>
            <input
              type="text" id="login-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ej. juanperez"
              disabled={isLoading}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Contraseña</label>
            <input
              type="password" id="login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            {isLoading ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
