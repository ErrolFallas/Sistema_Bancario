import { Link } from 'react-router-dom';
import '../css/dashboard.css';

/**
 * Unauthorized — Página de acceso denegado
 * Mejorada con glassmorphism card profesional.
 */
const Unauthorized = () => {
  return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 200px)' }}>
      <div className="glass-card" style={{ textAlign: 'center', maxWidth: '500px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚫</div>
        <h1 style={{
          color: 'var(--error-color)',
          fontSize: '1.8rem',
          fontWeight: 700,
          marginBottom: '1rem'
        }}>
          Acceso Denegado
        </h1>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
          No tiene los permisos necesarios para acceder a esta sección del sistema.
          Si cree que esto es un error, contacte al administrador.
        </p>
        <Link
          to="/"
          className="btn-primary"
          style={{ display: 'inline-block', textDecoration: 'none' }}
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
