const { ROLES, PESOS_ROLES } = require('../constants/roles');

/**
 * REGLA 1: Jerarquía de Modificación
 * Ningún rol puede modificar a un usuario de igual o mayor jerarquía.
 */
const puedeModificar = (rolOrigen, rolDestino) => {
  const pesoOrigen = PESOS_ROLES[rolOrigen] || 0;
  const pesoDestino = PESOS_ROLES[rolDestino] || 0;

  if (rolOrigen === ROLES.SUPER_ADMIN) return true;
  return pesoOrigen > pesoDestino;
};

/**
 * REGLA 2: Jerarquía de Creación (Reglas Bancarias Reales)
 * Define qué roles puede crear cada nivel de usuario.
 */
const puedeCrearRol = (rolOrigen, rolACrear) => {
  const origen = rolOrigen?.trim()?.toUpperCase();
  const destino = rolACrear?.trim()?.toUpperCase();

  if (origen === ROLES.SUPER_ADMIN) return true;

  if (origen === ROLES.ADMIN) {
    return [ROLES.GERENTE, ROLES.EMPLEADO, ROLES.CLIENTE].includes(destino);
  }

  if (origen === ROLES.GERENTE) {
    return [ROLES.EMPLEADO, ROLES.CLIENTE].includes(destino);
  }

  if (origen === ROLES.EMPLEADO) {
    return destino === ROLES.CLIENTE;
  }

  return false;
};

/**
 * REGLA 3: Protección de Seniority para SUPER_ADMIN
 * Un SUPER_ADMIN más reciente NO puede desactivar a uno más antiguo.
 * Soporta tanto strings como objetos de asociación de Sequelize.
 */
const esMasAntiguo = (usuarioActor, usuarioObjetivo) => {
  const getRolNombre = (u) => {
    if (!u) return null;
    if (typeof u.rol === 'string') return u.rol;
    if (u.rol && typeof u.rol.nombre === 'string') return u.rol.nombre;
    return null;
  };

  const rolActor = getRolNombre(usuarioActor);
  const rolObjetivo = getRolNombre(usuarioObjetivo);

  // Si alguno no es SUPER_ADMIN, no aplica protección de seniority (aplica jerarquía normal)
  if (rolActor !== ROLES.SUPER_ADMIN || rolObjetivo !== ROLES.SUPER_ADMIN) return true;
  
  const fechaActor = new Date(usuarioActor.createdAt);
  const fechaObjetivo = new Date(usuarioObjetivo.createdAt);

  // Actor debe ser anterior al objetivo para proceder (el más antiguo tiene el poder)
  // Si son iguales en fecha, se permite por consistencia técnica (raro en producción)
  return fechaActor <= fechaObjetivo;
};

module.exports = {
  JERARQUIA: PESOS_ROLES,
  puedeModificar,
  puedeCrearRol,
  esMasAntiguo,
  ROLES
};
