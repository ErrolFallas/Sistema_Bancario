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
            {/* ── Sección Personal (todos) ──────────── */}
            <Link to="/mi-cuenta" className="nav-item" onClick={closeMenu}>Mi Cuenta</Link>

            {/* ── CLIENTE: solo sus recursos ────────── */}
            {isCliente && (
              <>
                <Link to="/mis-cuentas" className="nav-item" onClick={closeMenu}>Mis Cuentas</Link>
                <Link to="/mis-tarjetas" className="nav-item" onClick={closeMenu}>Mis Tarjetas</Link>
                <Link to="/mis-prestamos" className="nav-item" onClick={closeMenu}>Mis Préstamos</Link>
              </>
            )}

            {/* ── Staff: Operaciones ────────────────── */}
            {isStaff && (
              <>
                <div className="nav-divider" />
                <Link to="/clientes" className="nav-item" onClick={closeMenu}>Clientes</Link>
                <Link to="/cuentas" className="nav-item" onClick={closeMenu}>Cuentas</Link>
                <Link to="/tarjetas" className="nav-item" onClick={closeMenu}>Tarjetas</Link>
                <Link to="/usuarios" className="nav-item" onClick={closeMenu}>Usuarios</Link>
              </>
            )}

            {/* ── Gerencia+: Gestión avanzada ──────── */}
            {isManagement && (
              <>
                <Link to="/prestamos" className="nav-item" onClick={closeMenu}>Préstamos</Link>
                <Link to="/transacciones" className="nav-item" onClick={closeMenu}>Transacciones</Link>
              </>
            )}

            {/* ── Admin+: Administración ────────────── */}
            {isAdmin && (
              <>
                <div className="nav-divider" />
                <Link to="/bancos" className="nav-item" onClick={closeMenu}>Bancos</Link>
                <Link to="/auditoria" className="nav-item" onClick={closeMenu}>Auditoría</Link>
              </>
            )}

            {/* ── SUPER_ADMIN: Roles ───────────────── */}
            {isSuperAdmin && (
              <Link to="/roles" className="nav-item" onClick={closeMenu}>Roles</Link>
            )}

            {/* ── User badge + logout ──────────────── */}
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
          <Link to="/login" className="btn-login" onClick={closeMenu}>
            Iniciar Sesión
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
