import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

const NavDropdown = ({ title, items, icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="nav-group" ref={dropdownRef} onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      <div className={`nav-trigger ${isOpen ? 'active' : ''}`}>
        {icon && <span className="trigger-icon">{icon}</span>}
        <span className="trigger-text">{title}</span>
        <i className={`trigger-arrow ${isOpen ? 'up' : ''}`}>▼</i>
      </div>
      
      <div className={`nav-dropdown ${isOpen ? 'show' : ''}`}>
        <div className="dropdown-arrow"></div>
        <ul className="dropdown-list">
          {items.map((item, index) => (
            <li key={index} className="dropdown-list-item">
              <Link to={item.path} className="dropdown-link" onClick={() => setIsOpen(false)}>
                {item.icon && <span className="item-icon">{item.icon}</span>}
                <div className="item-content">
                  <span className="item-title">{item.label}</span>
                  {item.description && <span className="item-desc">{item.description}</span>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NavDropdown;
