import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

const UserMenu = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="user-menu-container" ref={menuRef}>
      <div className={`user-badge-trigger ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        <div className="user-avatar">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <div className="user-meta desktop-only">
          <span className="user-display-name">{user.username}</span>
          <span className="user-display-role">{user.rol}</span>
        </div>
        <i className="trigger-arrow">▼</i>
      </div>

      <div className={`user-profile-dropdown ${isOpen ? 'show' : ''}`}>
        <div className="dropdown-header">
          <p className="header-label">Cuenta de Usuario</p>
          <p className="header-email">{user.email || `${user.username}@nexenbank.com`}</p>
        </div>
        
        <ul className="profile-menu-list">
          <li>
            <Link to="/mi-cuenta" className="profile-link" onClick={() => setIsOpen(false)}>
              <span className="link-icon">👤</span> Mi Perfil
            </Link>
          </li>
          <li>
            <Link to="/configuracion" className="profile-link disabled" onClick={() => setIsOpen(false)}>
              <span className="link-icon">⚙️</span> Configuración
            </Link>
          </li>
          <li className="menu-divider"></li>
          <li>
            <button className="profile-link logout-btn" onClick={() => { setIsOpen(false); onLogout(); }}>
              <span className="link-icon">🚪</span> Cerrar Sesión
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UserMenu;
