import { Link } from 'react-router-dom';
import StatusBadge from '../ui/StatusBadge';
import { getBadgeClass } from '../../helpers/roleHelpers';
import '../../css/components.css';

/**
 * UserRow — Fila individual de la tabla de usuarios
 * Muestra datos del usuario con badges, estado y acciones.
 */
const UserRow = ({ usuario, onDesactivar, onReactivar, currentUserRole }) => {
  const rolNombre = usuario.rol?.nombre || 'Sin rol';
  const rolUpper = rolNombre.toUpperCase();
  const isInactive = !usuario.cuentaActiva;
  const isSuperAdmin = rolUpper === 'SUPER_ADMIN';

  const getEntidadAsociada = () => {
    if (usuario.cliente) {
      return `${usuario.cliente.nombre} ${usuario.cliente.apellido}`;
    }
    if (usuario.empleado) {
      return `${usuario.empleado.nombre} ${usuario.empleado.apellido}`;
    }
    return '—';
  };

  return (
    <tr className={isInactive ? 'row-inactive' : ''}>
      <td>{usuario.idUsuario}</td>
      <td style={{ fontWeight: 600 }}>{usuario.username}</td>
      <td>
        <span className={`badge ${getBadgeClass(rolNombre)}`}>
          {rolNombre}
        </span>
      </td>
      <td style={{ color: 'var(--text-muted)' }}>
        {getEntidadAsociada()}
      </td>
      <td>
        <StatusBadge isActive={usuario.cuentaActiva} />
      </td>
      <td>
        {usuario.usuarioLogeado
          ? <span style={{ color: 'var(--secondary-color)', fontSize: '0.85rem' }}>🟢 En línea</span>
          : <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>⚪ Desconectado</span>
        }
      </td>
      <td>
        {isSuperAdmin ? (
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Protegido</span>
        ) : (
          <div className="action-buttons">
            <Link to={`/usuarios/${usuario.idUsuario}/editar`} className="btn-editar">
              Editar
            </Link>
            {isInactive ? (
              <button className="btn-reactivar" onClick={() => onReactivar(usuario)}>
                Reactivar
              </button>
            ) : (
              <button className="btn-desactivar" onClick={() => onDesactivar(usuario)}>
                Desactivar
              </button>
            )}
          </div>
        )}
      </td>
    </tr>
  );
};

export default UserRow;
