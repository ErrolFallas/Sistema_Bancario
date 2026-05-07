import { Link } from 'react-router-dom';

/**
 * EmptyState — Estado vacío profesional bancario
 * ───────────────────────────────────────────────
 * Muestra un mensaje elegante cuando no hay datos.
 * Soporta iconos, CTAs y variantes por módulo.
 */

// Presets por módulo para consistencia
const PRESETS = {
  usuarios: { icon: '👥', title: 'No hay usuarios registrados', description: 'Crea el primer usuario para comenzar a operar el sistema.' },
  clientes: { icon: '🧑‍💼', title: 'No hay clientes registrados', description: 'Los clientes se crean junto con su usuario desde el formulario de alta.' },
  cuentas: { icon: '🏦', title: 'No existen cuentas registradas', description: 'Crea una nueva cuenta bancaria para comenzar a operar.' },
  tarjetas: { icon: '💳', title: 'No existen tarjetas registradas', description: 'Las tarjetas se asocian a las cuentas existentes.' },
  prestamos: { icon: '📋', title: 'No existen préstamos registrados', description: 'Los préstamos se pueden solicitar desde el módulo correspondiente.' },
  transacciones: { icon: '💸', title: 'No hay transacciones registradas', description: 'Las transacciones aparecerán aquí cuando se realicen operaciones.' },
  roles: { icon: '🔐', title: 'No hay roles registrados', description: 'El sistema requiere al menos los roles base para funcionar.' },
  auditoria: { icon: '📊', title: 'No hay registros de auditoría', description: 'Los registros se generan automáticamente con cada operación del sistema.' },
  bancos: { icon: '🏛️', title: 'No hay bancos registrados', description: 'Registra la institución bancaria para comenzar.' },
  movimientos: { icon: '📈', title: 'No hay movimientos recientes', description: 'Los movimientos se registran con cada transacción.' },
  generic: { icon: '📭', title: 'No hay registros disponibles', description: 'No se encontraron datos para mostrar.' },
};

const EmptyState = ({
  preset,
  icon,
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
}) => {
  // Usar preset si se proporciona, con override de props individuales
  const defaults = PRESETS[preset] || PRESETS.generic;
  const displayIcon = icon || defaults.icon;
  const displayTitle = title || defaults.title;
  const displayDescription = description || defaults.description;

  return (
    <div className="empty-state-container">
      <div className="empty-state-icon">{displayIcon}</div>
      <h3 className="empty-state-title">{displayTitle}</h3>
      <p className="empty-state-description">{displayDescription}</p>
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem', textDecoration: 'none' }}>
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionTo && (
        <button className="btn-primary" onClick={onAction} style={{ marginTop: '1rem' }}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
