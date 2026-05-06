import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };

  // Roles con acceso administrativo
  const isAdminRole = ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'EMPLEADO'].includes(user?.rol);
  const isSuperAdmin = user?.rol === 'SUPER_ADMIN';

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">🏦 Sistema Bancario</Link>
      </div>

      <div className="navbar-menu">
        {user ? (
          <>
            <Link to="/mi-cuenta" className="nav-item">Mi Cuenta</Link>

            {/* Opciones Administrativas */}
            {isAdminRole && (
              <>
                <Link to="/clientes" className="nav-item">Clientes</Link>
                <Link to="/usuarios" className="nav-item">Usuarios</Link>
              </>
            )}

            {/* Solo SUPER_ADMIN ve Gestión de Roles */}
            {isSuperAdmin && (
              <Link to="/roles" className="nav-item">Roles</Link>
            )}

            <div className="navbar-user">
              <span className="user-badge">
                👤 {user.username} <small>({user.rol})</small>
              </span>
              <button onClick={handleLogout} className="btn-logout">
                Cerrar Sesión
              </button>
            </div>
          </>
        ) : (
          <Link to="/login" className="btn-login">
            Iniciar Sesión
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
