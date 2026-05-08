import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canAccess, canManageUsers } from '../helpers/roleHelpers';

// Components
import NavDropdown from './layout/NavDropdown';
import UserMenu from './layout/UserMenu';
import MobileSidebar from './layout/MobileSidebar';

// Styles
import '../css/navbar-enterprise.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // ── Configuración de Menús con RBAC Granular ──────────────────
  // Cada item define los roles que pueden verlo.
  // SUPER_ADMIN accede a todo (manejado por canAccess).
  
  const menuGroups = [
    {
      title: 'Operaciones',
      // Visible para todo el staff bancario (no CLIENTE)
      roles: ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'EMPLEADO'],
      items: [
        { label: 'Clientes', path: '/clientes', icon: '👥', description: 'Gestión de perfiles de clientes', roles: ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'EMPLEADO'] },
        { label: 'Cuentas', path: '/cuentas', icon: '💰', description: 'Control de productos financieros', roles: ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'EMPLEADO'] },
        { label: 'Tarjetas', path: '/tarjetas', icon: '💳', description: 'Emisión y administración de tarjetas', roles: ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'EMPLEADO'] },
        { label: 'Préstamos', path: '/prestamos', icon: '🏠', description: 'Créditos y financiamiento', roles: ['SUPER_ADMIN', 'ADMIN', 'GERENTE'] },
        { label: 'Transacciones', path: '/transacciones', icon: '🔄', description: 'Historial de movimientos', roles: ['SUPER_ADMIN', 'ADMIN', 'GERENTE'] },
      ]
    },
    {
      title: 'Administración',
      // Staff ve menú de Administración — cada item se filtra por rol
      roles: ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'EMPLEADO'],
      items: [
        { label: 'Usuarios', path: '/usuarios', icon: '👤', description: 'Gestión de personal del sistema', roles: ['SUPER_ADMIN', 'ADMIN', 'GERENTE'] },
        { label: 'Crear Usuario', path: '/usuarios/crear', icon: '➕', description: 'Onboarding de personal y clientes', roles: ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'EMPLEADO'] },
        { label: 'Roles', path: '/roles', icon: '🔑', description: 'Control de acceso jerárquico', roles: ['SUPER_ADMIN'] },
        { label: 'Bancos', path: '/bancos', icon: '🏢', description: 'Configuración de entidades', roles: ['SUPER_ADMIN', 'ADMIN'] },
      ]
    },
    {
      title: 'Seguridad',
      roles: ['SUPER_ADMIN', 'ADMIN'],
      items: [
        { label: 'Auditoría', path: '/auditoria', icon: '📋', description: 'Logs de eventos del sistema', roles: ['SUPER_ADMIN', 'ADMIN'] },
        { label: 'Sesiones', path: '/sesiones', icon: '⏱️', description: 'Control de actividad activa', roles: ['SUPER_ADMIN', 'ADMIN'] },
      ]
    }
  ];

  // ── Filtrado dinámico RBAC ────────────────────────────────────
  const filteredGroups = user
    ? menuGroups
        .filter(group => canAccess(user.rol, group.roles))
        .map(group => ({
          ...group,
          items: group.items.filter(item => canAccess(user.rol, item.roles))
        }))
        .filter(group => group.items.length > 0) // Ocultar grupos vacíos
    : [];

  return (
    <header className="navbar-enterprise">
      <div className="nav-container">
        
        {/* ── SECCIÓN IZQUIERDA: Logo ────────────────── */}
        <div className="brand-section">
          <Link to="/">
            <span className="brand-logo">🏦</span>
            <span className="brand-name">Nexen <span className="desktop-only">Bank</span></span>
          </Link>
        </div>

        {/* ── SECCIÓN CENTRAL: Navegación ─────────────── */}
        <nav className="main-nav">
          <Link to="/" className="nav-home-link">Dashboard</Link>
          
          {user && filteredGroups.map((group, index) => (
            <NavDropdown 
              key={index} 
              title={group.title} 
              items={group.items} 
            />
          ))}
        </nav>

        {/* ── SECCIÓN DERECHA: Usuario ────────────────── */}
        <div className="user-section">
          {user ? (
            <UserMenu user={user} onLogout={handleLogout} />
          ) : (
            <Link to="/login" className="login-link-btn">Iniciar Sesión</Link>
          )}

          {/* Hamburguesa Mobile */}
          <button className="mobile-toggle" onClick={() => setMobileOpen(true)}>
            ☰
          </button>
        </div>

      </div>

      {/* ── Mobile Sidebar ─────────────────────────── */}
      <MobileSidebar 
        isOpen={mobileOpen} 
        onClose={() => setMobileOpen(false)} 
        menuGroups={filteredGroups}
        user={user}
        onLogout={handleLogout}
      />
    </header>
  );
};

export default Navbar;
