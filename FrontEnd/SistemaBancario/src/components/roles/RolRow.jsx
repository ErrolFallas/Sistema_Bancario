import StatusBadge from '../ui/StatusBadge';
import { getBadgeClass, isProtectedRole } from '../../helpers/roleHelpers';

/**
 * RolRow — Fila individual de la tabla de roles
 */
const RolRow = ({ rol, onDesactivar, onReactivar, onEliminar }) => {
  const nombreUpper = rol.nombre.toUpperCase();
  const esRolBase = isProtectedRole(nombreUpper);
  const isInactive = rol.isActive === false;

  return (
    <tr className={isInactive ? 'row-inactive' : ''}>
      <td>{rol.idRol}</td>
      <td>
        <span className={`badge ${getBadgeClass(rol.nombre)}`}>
          {rol.nombre}
        </span>
      </td>
      <td style={{ color: 'var(--text-muted)' }}>
        {rol.descripcion || '—'}
      </td>
      <td style={{ color: 'var(--text-light)', fontSize: '0.85rem', maxWidth: '300px', whiteSpace: 'normal' }}>
        {rol.permisos && rol.permisos.length > 0
          ? rol.permisos.map(p => p.nombre).join(', ')
          : <span style={{ color: 'var(--text-muted)' }}>Sin permisos específicos</span>
        }
      </td>
      <td>
        <StatusBadge isActive={rol.isActive !== false} />
      </td>
      <td>
        {esRolBase
          ? <span className="badge badge-protegido">👑 Sistema</span>
          : <span className="badge badge-admin">Custom</span>
        }
      </td>
      <td>
        {esRolBase ? (
          <div className="action-buttons">
            {nombreUpper !== 'SUPER_ADMIN' && (
              isInactive ? (
                <button className="btn-reactivar" onClick={() => onReactivar(rol)}>
                  Reactivar
                </button>
              ) : (
                <button className="btn-desactivar" onClick={() => onDesactivar(rol)}>
                  Desactivar
                </button>
              )
            )}
            {nombreUpper === 'SUPER_ADMIN' && (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Indispensable</span>
            )}
          </div>
        ) : (
          <div className="action-buttons">
            {isInactive ? (
              <button className="btn-reactivar" onClick={() => onReactivar(rol)}>
                Reactivar
              </button>
            ) : (
              <button className="btn-desactivar" onClick={() => onDesactivar(rol)}>
                Desactivar
              </button>
            )}
            <button className="btn-danger" onClick={() => onEliminar(rol)}>
              Eliminar
            </button>
          </div>
        )}
      </td>
    </tr>
  );
};

export default RolRow;
