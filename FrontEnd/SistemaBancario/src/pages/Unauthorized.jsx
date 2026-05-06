import { Link } from 'react-router-dom';
import '../css/dashboard.css';

const Unauthorized = () => {
  return (
    <div className="page-container">
      <div className="hero-section">
        <h1 style={{ color: 'var(--error-color)', WebkitTextFillColor: 'var(--error-color)' }}>
          🚫 Acceso Denegado
        </h1>
        <p>
          No tiene los permisos necesarios para acceder a esta sección.
          Si cree que esto es un error, contacte al administrador del sistema.
        </p>
        <Link to="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '2rem', textDecoration: 'none' }}>
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
