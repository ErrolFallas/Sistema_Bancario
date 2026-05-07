import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../css/navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const closeMenu = () => setMenuOpen(false);

  // Jerarquía de visualización
  const isAdmin = user?.rol === 'ADMIN';
  const isSuperAdmin = user?.rol === 'SUPER_ADMIN';
  const isGerente = user?.rol === 'GERENTE';
  const isEmpleado = user?.rol === 'EMPLEADO';
  const isCliente = user?.rol === 'CLIENTE';

  const isStaff = isAdmin || isSuperAdmin || isGerente || isEmpleado;
  const isManagement = isAdmin || isSuperAdmin || isGerente;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* ── Brand ──────────────────────────── */}
        <div className="navbar-brand">
          <Link to="/" onClick={closeMenu}>
            <span className="brand-icon">🏦</span>
            <span className="brand-text">Sistema Bancario</span>
          </Link>
        </div>

        {/* ── Mobile Toggle ──────────────────── */}
        <div className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </div>

        {/* ── Navigation Menu ────────────────── */}
        <div className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
          {user ? (
            <>
              {/* GRUPO 1: OPERACIONES */}
              <div className="nav-group">
                <div className="nav-trigger">
                  <span>Operaciones</span> <i>▼</i>
                </div>
                <div className="nav-dropdown">
                  {isStaff && (
                    <>
                      <Link to="/clientes" className="dropdown-item" onClick={closeMenu}>
                        <span className="dropdown-icon">👥</span> Clientes
                      </Link>
                      <Link to="/cuentas" className="dropdown-item" onClick={closeMenu}>
                        <span className="dropdown-icon">💰</span> Cuentas
                      </Link>
                      <Link to="/tarjetas" className="dropdown-item" onClick={closeMenu}>
                        <span className="dropdown-icon">💳</span> Tarjetas
                      </Link>
                    </>
                  )}
                  {isManagement && (
                    <>
                      <Link to="/prestamos" className="dropdown-item" onClick={closeMenu}>
                        <span className="dropdown-icon">🏠</span> Préstamos
                      </Link>
                      <Link to="/transacciones" className="dropdown-item" onClick={closeMenu}>
                        <span className="dropdown-icon">🔄</span> Transacciones
                      </Link>
                    </>
                  )}
                  {isCliente && (
                    <>
                      <Link to="/mis-cuentas" className="dropdown-item" onClick={closeMenu}>
                        <span className="dropdown-icon">💳</span> Mis Cuentas
                      </Link>
                      <Link to="/mis-transacciones" className="dropdown-item" onClick={closeMenu}>
                        <span className="dropdown-icon">🔄</span> Movimientos
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* GRUPO 2: ADMINISTRACIÓN */}
              {isManagement && (
                <div className="nav-group">
                  <div className="nav-trigger">
                    <span>Administración</span> <i>▼</i>
                  </div>
                  <div className="nav-dropdown">
                    <Link to="/usuarios" className="dropdown-item" onClick={closeMenu}>
                      <span className="dropdown-icon">👤</span> Usuarios
                    </Link>
                    <Link to="/bancos" className="dropdown-item" onClick={closeMenu}>
                      <span className="dropdown-icon">🏢</span> Bancos
                    </Link>
                    <Link to="/auditoria" className="dropdown-item" onClick={closeMenu}>
                      <span className="dropdown-icon">📋</span> Auditoría
                    </Link>
                    {isSuperAdmin && (
                      <Link to="/roles" className="dropdown-item" onClick={closeMenu}>
                        <span className="dropdown-icon">🔑</span> Roles
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <Link to="/login" className="nav-item" onClick={closeMenu}>Iniciar Sesión</Link>
          )}
        </div>

        {/* ── User Profile & Logout ──────────── */}
        {user && (
          <div className="navbar-user">
            <div className="user-badge">
              <div className="user-info">
                <span className="user-name">{user.username}</span>
                <span className="user-role">{user.rol}</span>
              </div>
            </div>
            <button onClick={handleLogout} className="btn-logout-enterprise" title="Cerrar Sesión">
              <span>Salir</span> 🚪
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
