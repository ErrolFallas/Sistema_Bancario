import { Link } from 'react-router-dom';

const MobileSidebar = ({ isOpen, onClose, menuGroups, user, onLogout }) => {
  return (
    <>
      <div className={`mobile-sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}></div>
      
      <aside className={`mobile-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span className="brand-icon">🏦</span>
            <span className="brand-text">Nexen Bank</span>
          </div>
          <button className="close-sidebar" onClick={onClose}>✕</button>
        </div>

        <div className="sidebar-user-section">
          <div className="user-info-card">
            <div className="user-avatar-large">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <p className="user-name">{user?.username}</p>
              <p className="user-role">{user?.rol}</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link to="/" className="sidebar-nav-link" onClick={onClose}>
            <span className="nav-icon">🏠</span> Dashboard
          </Link>

          {menuGroups.map((group, gIndex) => (
            <div key={gIndex} className="sidebar-nav-group">
              <p className="group-label">{group.title}</p>
              <div className="group-links">
                {group.items.map((item, iIndex) => (
                  <Link key={iIndex} to={item.path} className="sidebar-nav-link" onClick={onClose}>
                    <span className="nav-icon">{item.icon}</span> {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout-btn" onClick={() => { onLogout(); onClose(); }}>
            <span className="nav-icon">🚪</span> Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
};

export default MobileSidebar;
