import { Link } from 'react-router-dom';

/**
 * PageHeader — Header de página con título gradiente y acción
 * Reemplaza el patrón .page-header repetido en cada página.
 */
const PageHeader = ({ title, actionLabel, actionTo, onAction, children }) => {
  return (
    <div className="page-header">
      <h1>{title}</h1>
      <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
        {children}
        {actionLabel && actionTo && (
          <Link to={actionTo} className="btn-primary" style={{ textDecoration: 'none' }}>
            {actionLabel}
          </Link>
        )}
        {actionLabel && onAction && !actionTo && (
          <button className="btn-primary" onClick={onAction}>
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
