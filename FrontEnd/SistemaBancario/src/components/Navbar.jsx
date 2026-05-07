import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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

  // ── Configuración de Menús (Arquitectura Enterprise) ───────────
  
  const menuGroups = [
    {
      title: 'Operaciones',
      items: [
        { label: 'Clientes', path: '/clientes', icon: '👥', description: 'Gestión de perfiles de clientes' },
        { label: 'Cuentas', path: '/cuentas', icon: '💰', description: 'Control de productos financieros' },
        { label: 'Tarjetas', path: '/tarjetas', icon: '💳', description: 'Emisión y administración de tarjetas' },
        { label: 'Préstamos', path: '/prestamos', icon: '🏠', description: 'Créditos y financiamiento' },
        { label: 'Transacciones', path: '/transacciones', icon: '🔄', description: 'Historial de movimientos' },
      ]
    },
    {
      title: 'Administración',
      items: [
        { label: 'Usuarios', path: '/usuarios', icon: '👤', description: 'Gestión de personal del sistema' },
        { label: 'Roles', path: '/roles', icon: '🔑', description: 'Control de acceso jerárquico' },
        { label: 'Bancos', path: '/bancos', icon: '🏢', description: 'Configuración de entidades' },
      ]
    },
    {
      title: 'Seguridad',
      items: [
        { label: 'Auditoría', path: '/auditoria', icon: '📋', description: 'Logs de eventos del sistema' },
        { label: 'Sesiones', path: '/sesiones', icon: '⏱️', description: 'Control de actividad activa' },
      ]
    }
  ];

  // Filtros de Rol (RBAC)
  const isAdmin = user?.rol === 'ADMIN' || user?.rol === 'SUPER_ADMIN';
  const isManagement = isAdmin || user?.rol === 'GERENTE';

  // Solo mostrar grupos según permisos
  const filteredGroups = menuGroups.filter(group => {
    if (group.title === 'Administración' || group.title === 'Seguridad') {
      return isManagement;
    }
    return true; // Operaciones visible para staff
  });

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
