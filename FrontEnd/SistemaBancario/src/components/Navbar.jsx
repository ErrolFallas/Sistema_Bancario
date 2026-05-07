import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import bancoService from '../services/bancoService';
import { canAccess, STAFF_ROLES, ADMIN_ROLES, MANAGEMENT_ROLES } from '../helpers/roleHelpers';
import '../css/navbar.css';

/**
 * Navbar — Navegación jerárquica dinámica por rol + Ownership
 * ────────────────────────────────────────────────────────────
 * CLIENTE: Mi Cuenta, Mis Cuentas, Mis Tarjetas, Mis Préstamos
 * EMPLEADO: Clientes, Cuentas, Tarjetas, Usuarios
 * GERENTE: + Préstamos, Transacciones
 * ADMIN: + Roles, Bancos, Auditoría
 * SUPER_ADMIN: Todo
 */
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [nombreBanco, setNombreBanco] = useState('Sistema Bancario');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fetchBanco = async () => {
      try {
        const bancos = await bancoService.getAll();
        if (bancos && bancos.length > 0) {
          setNombreBanco(bancos[0].nombre);
        }
      } catch {
        setNombreBanco('Sistema Bancario');
      }
    };
    fetchBanco();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };

  const closeMenu = () => setMenuOpen(false);

  const isCliente = user?.rol?.toUpperCase() === 'CLIENTE';
  const isStaff = canAccess(user?.rol, STAFF_ROLES);
  const isManagement = canAccess(user?.rol, MANAGEMENT_ROLES);
  const isAdmin = canAccess(user?.rol, ADMIN_ROLES);
  const isSuperAdmin = user?.rol?.toUpperCase() === 'SUPER_ADMIN';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" onClick={closeMenu}>🏦 {nombreBanco}</Link>
        </div>

        {/* Hamburguesa responsive */}
        {user && (
          <button
            className="navbar-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menú"
          >
            <span className={`hamburger ${menuOpen ? 'open' : ''}`} />
          </button>
        )}

        <div className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
          {user ? (
            <>
              {/* ── CENTRAL NAVIGATION GROUP ─────────── */}
              <div className="nav-links">
                <Link to="/mi-cuenta" className="nav-item" onClick={closeMenu}>Mi Cuenta</Link>

                {isCliente && (
                  <>
                    <div className="nav-divider" />
                    <Link to="/mis-cuentas" className="nav-item" onClick={closeMenu}>Cuentas</Link>
                    <Link to="/mis-tarjetas" className="nav-item" onClick={closeMenu}>Tarjetas</Link>
                  </>
                )}

                {isStaff && (
                  <>
                    <div className="nav-divider" />
                    <Link to="/clientes" className="nav-item" onClick={closeMenu}>Clientes</Link>
                    <Link to="/cuentas" className="nav-item" onClick={closeMenu}>Cuentas</Link>
                    <Link to="/usuarios" className="nav-item" onClick={closeMenu}>Usuarios</Link>
                  </>
                )}

                {isManagement && (
                  <>
                    <Link to="/prestamos" className="nav-item" onClick={closeMenu}>Préstamos</Link>
                    <Link to="/transacciones" className="nav-item" onClick={closeMenu}>Transacciones</Link>
                  </>
                )}

                {(isAdmin || isSuperAdmin) && (
                  <>
                    <div className="nav-divider" />
                    <Link to="/bancos" className="nav-item" onClick={closeMenu}>Bancos</Link>
                    <Link to="/auditoria" className="nav-item" onClick={closeMenu}>Logs</Link>
                    {isSuperAdmin && <Link to="/roles" className="nav-item" onClick={closeMenu}>Roles</Link>}
                  </>
                )}
              </div>

              {/* ── USER & SESSION GROUP (RIGHT) ─────── */}
              <div className="navbar-user">
                <div className="user-badge">
                  <span className="user-icon">👤</span>
                  <div className="user-info">
                    <span className="user-name">{user.username}</span>
                    <span className="user-role">{user.rol}</span>
                  </div>
                </div>
                <button onClick={handleLogout} className="btn-logout" title="Cerrar Sesión">
                  <span className="logout-icon">🚪</span>
                  <span className="logout-text">Cerrar Sesión</span>
                </button>
              </div>
            </>
          ) : (
            <div className="navbar-auth">
              <Link to="/login" className="btn-login" onClick={closeMenu}>
                Acceso Sistema
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
