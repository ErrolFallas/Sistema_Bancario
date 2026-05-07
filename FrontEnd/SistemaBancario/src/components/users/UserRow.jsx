import { Link } from 'react-router-dom';
import StatusBadge from '../ui/StatusBadge';
import { getBadgeClass, canModify, hasSeniority } from '../../helpers/roleHelpers';
import '../../css/components.css';

/**
 * UserRow — Fila individual de la tabla de usuarios
 * Implementa reglas de gobernanza visuales refinadas.
 */
const UserRow = ({ usuario, onDesactivar, onReactivar, currentUser }) => {
  const rolNombre = usuario.rol?.nombre || 'Sin rol';
  const rolUpper = rolNombre.toUpperCase();
  const isInactive = !usuario.cuentaActiva;
  
  // ── ESTADOS DE IDENTIDAD ───────────────────────────────────────
  const esElMismo = currentUser?.idUsuario === usuario.idUsuario;
  const targetEsSuperAdmin = rolUpper === 'SUPER_ADMIN';
  const actorEsSuperAdmin = currentUser?.rol === 'SUPER_ADMIN';

  // ── REGLAS DE GOBERNANZA VISUAL ────────────────────────────────
  
  // 1. Jerarquía: ¿Puede el actor modificar al objetivo?
  const tienePermisoJerarquia = canModify(currentUser?.rol, rolUpper, esElMismo);
  
  // 2. Seniority: ¿El actor es lo suficientemente antiguo si el objetivo es SUPER_ADMIN?
  // hasSeniority ahora maneja internamente el caso de auto-gestión (esElMismo)
  const tieneAntiguedad = hasSeniority(currentUser, usuario);
  
  // 3. Bloqueo de Desactivación Directa para SUPER_ADMIN (Regla Bancaria #1)
  // Ningún SUPER_ADMIN puede desactivarse a sí mismo directamente.
  const bloqueoAutoDesactivacion = esElMismo && targetEsSuperAdmin;

  // Lógica final de visibilidad de acciones
  const puedeEditar = tienePermisoJerarquia && tieneAntiguedad;
  
  // Puede desactivar si:
  // - Tiene jerarquía/antigüedad
  // - NO es el mismo si el rol es SUPER_ADMIN
  const puedeDesactivarAccion = tienePermisoJerarquia && tieneAntiguedad && !bloqueoAutoDesactivacion;

  const getEntidadAsociada = () => {
    if (usuario.cliente) return `${usuario.cliente.nombre} ${usuario.cliente.apellido}`;
    if (usuario.empleado) return `${usuario.empleado.nombre} ${usuario.empleado.apellido}`;
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
      <td style={{ color: 'var(--text-muted)' }}>{getEntidadAsociada()}</td>
      <td><StatusBadge isActive={usuario.cuentaActiva} /></td>
      <td>
        {usuario.usuarioLogeado
          ? <span style={{ color: 'var(--secondary-color)', fontSize: '0.85rem' }}>🟢 En línea</span>
          : <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>⚪ Desconectado</span>
        }
      </td>
      <td>
        <div className="action-buttons">
          {puedeEditar ? (
            <Link to={`/usuarios/${usuario.idUsuario}/editar`} className="btn-editar">
              {esElMismo ? 'Mi Perfil' : 'Editar'}
            </Link>
          ) : (
            <span className="action-locked" title="Protección de jerarquía bancaria o antigüedad">🔒 Bloqueado</span>
          )}

          {!isInactive && (
            puedeDesactivarAccion ? (
              <button className="btn-desactivar" onClick={() => onDesactivar(usuario)}>
                Desactivar
              </button>
            ) : (
              esElMismo && targetEsSuperAdmin && (
                <span className="action-info" title="Debes cambiar tu rol a ADMIN antes de desactivar">
                  Cambio de rol req.
                </span>
              )
            )
          )}

          {isInactive && (
            tienePermisoJerarquia && (actorEsSuperAdmin || !targetEsSuperAdmin) ? (
              <button className="btn-reactivar" onClick={() => onReactivar(usuario)}>
                Reactivar
              </button>
            ) : (
              <span className="action-locked" title="Solo un SUPER_ADMIN puede reactivar esta cuenta">🔒 Protegido</span>
            )
          )}
          
          {esElMismo && !isInactive && (
             <span className="current-user-tag">Tú</span>
          )}
        </div>
      </td>
    </tr>
  );
};

export default UserRow;
