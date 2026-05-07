// ============================================
// Utilidad: jerarquia.js
// Lógica de jerarquía estricta de RBAC y Gobernanza Bancaria
// SUPER_ADMIN > ADMIN > GERENTE > EMPLEADO > CLIENTE
// ============================================

const JERARQUIA = {
  'SUPER_ADMIN': 100,
  'ADMIN': 80,
  'GERENTE': 60,
  'EMPLEADO': 40,
  'CLIENTE': 20
};

/**
 * REGLA 1: Jerarquía de Modificación
 * Ningún rol puede modificar a un usuario de igual o mayor jerarquía.
 */
const puedeModificar = (rolOrigen, rolDestino) => {
  const pesoOrigen = JERARQUIA[rolOrigen] || 0;
  const pesoDestino = JERARQUIA[rolDestino] || 0;

  if (rolOrigen === 'SUPER_ADMIN') return true;
  return pesoOrigen > pesoDestino;
};

/**
 * REGLA 2: Jerarquía de Creación (Reglas Bancarias Reales)
 * Define qué roles puede crear cada nivel de usuario.
 */
const puedeCrearRol = (rolOrigen, rolACrear) => {
  const origen = rolOrigen?.trim()?.toUpperCase();
  const destino = rolACrear?.trim()?.toUpperCase();

  if (origen === 'SUPER_ADMIN') return true; // Puede crear cualquier rol

  if (origen === 'ADMIN') {
    // Solo puede crear GERENTE, EMPLEADO, CLIENTE
    return ['GERENTE', 'EMPLEADO', 'CLIENTE'].includes(destino);
  }

  if (origen === 'GERENTE') {
    // Solo puede crear EMPLEADO, CLIENTE
    return ['EMPLEADO', 'CLIENTE'].includes(destino);
  }

  if (origen === 'EMPLEADO') {
    // Solo puede crear CLIENTE
    return destino === 'CLIENTE';
  }

  return false; // CLIENTE y otros no pueden crear usuarios
};

/**
 * REGLA 3: Protección de Seniority para SUPER_ADMIN
 * Un SUPER_ADMIN más reciente NO puede desactivar a uno más antiguo.
 */
const esMasAntiguo = (usuarioActor, usuarioObjetivo) => {
  if (usuarioActor.rol !== 'SUPER_ADMIN' || usuarioObjetivo.rol !== 'SUPER_ADMIN') return true;
  
  const fechaActor = new Date(usuarioActor.createdAt);
  const fechaObjetivo = new Date(usuarioObjetivo.createdAt);

  // Actor debe ser anterior o igual al objetivo para proceder
  return fechaActor <= fechaObjetivo;
};

module.exports = {
  JERARQUIA,
  puedeModificar,
  puedeCrearRol,
  esMasAntiguo
};
