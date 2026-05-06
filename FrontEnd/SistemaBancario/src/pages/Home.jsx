import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import '../css/dashboard.css';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="page-container">
      {!user ? (
        <div className="hero-section">
          <h1>Bienvenido a Tu Banco de Confianza</h1>
          <p>
            Gestiona tus finanzas de forma segura y rápida con nuestra plataforma digital.
            Inicia sesión para acceder a tus cuentas, solicitar préstamos y realizar transferencias.
          </p>
        </div>
      ) : (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '2rem' }}>Hola, {user.username}! 👋</h1>
          <div className="dashboard-cards">
            <div className="card">
              <h3>Tu Rol: {user.rol}</h3>
              <p>
                {user.rol === 'CLIENTE' 
                  ? 'Aquí podrás ver tus saldos, tarjetas y movimientos recientes.' 
                  : 'Panel de control administrativo activo. Accede a las herramientas desde la barra de navegación.'}
              </p>
            </div>

            {['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'EMPLEADO'].includes(user.rol) && (
              <div className="card highlight">
                <h3>⚡ Acciones Rápidas</h3>
                <p style={{ marginBottom: '1rem' }}>Cree un nuevo usuario con su entidad asociada en un solo paso.</p>
                <Link to="/usuarios/crear" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
                  Crear Usuario
                </Link>
              </div>
            )}

            {user.rol === 'CLIENTE' && (
              <div className="card highlight">
                <h3>Resumen de Cuentas</h3>
                <p>Próximamente verás aquí el estado de tus cuentas activas.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
