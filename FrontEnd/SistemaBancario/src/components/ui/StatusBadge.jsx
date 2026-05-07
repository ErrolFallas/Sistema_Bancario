/**
 * StatusBadge — Badge visual de estado activo/inactivo
 * Usa semáforo de color para indicar el estado de cualquier entidad.
 */
const StatusBadge = ({ isActive, activeLabel = 'Activo', inactiveLabel = 'Inactivo' }) => {
  return (
    <span
      className={`status-badge ${isActive ? 'status-active' : 'status-inactive'}`}
      title={isActive ? activeLabel : inactiveLabel}
    >
      <span className="status-dot" />
      {isActive ? activeLabel : inactiveLabel}
    </span>
  );
};

export default StatusBadge;
