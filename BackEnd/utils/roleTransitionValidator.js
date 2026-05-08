// ============================================
// Utilidad: roleTransitionValidator.js
// Validación de transiciones de rol con datos laborales
// ============================================
// REGLA DE NEGOCIO:
//   - SUPER_ADMIN y ADMIN pueden existir SIN id_empleado
//   - GERENTE y EMPLEADO REQUIEREN id_empleado
//   - Al degradar de ADMIN/SUPER_ADMIN a GERENTE/EMPLEADO,
//     si no existe id_empleado, se bloquea con HTTP 422
//     indicando que se deben completar datos laborales primero.
// ============================================

/**
 * Roles que requieren obligatoriamente un registro en EMPLEADOS.
 */
const ROLES_REQUIEREN_EMPLEADO = ['GERENTE', 'EMPLEADO'];

/**
 * Roles que pueden existir SIN registro en EMPLEADOS.
 */
const ROLES_SIN_EMPLEADO = ['SUPER_ADMIN', 'ADMIN', 'CLIENTE'];

/**
 * Determina si un rol destino requiere datos de empleado.
 * @param {string} targetRole - Nombre del rol destino (uppercase)
 * @returns {boolean}
 */
const requiresEmpleadoData = (targetRole) => {
  const role = targetRole?.trim()?.toUpperCase();
  return ROLES_REQUIEREN_EMPLEADO.includes(role);
};

/**
 * Determina si un rol puede existir sin empleado.
 * @param {string} targetRole - Nombre del rol destino (uppercase)
 * @returns {boolean}
 */
const canExistWithoutEmpleado = (targetRole) => {
  const role = targetRole?.trim()?.toUpperCase();
  return ROLES_SIN_EMPLEADO.includes(role);
};

/**
 * Valida si una transición de rol es posible dado el id_empleado actual o solicitado.
 * 
 * @param {number|null} idEmpleado - ID del empleado (ya existente o en el request)
 * @param {string} currentRoleName - Nombre del rol actual (uppercase)
 * @param {string} targetRoleName - Nombre del rol destino (uppercase)
 * @returns {Object} { valid: boolean, requiresEmpleadoData?: boolean, message?: string }
 */
const validateRoleTransition = (idEmpleado, currentRoleName, targetRoleName) => {
  const current = currentRoleName?.trim()?.toUpperCase();
  const target = targetRoleName?.trim()?.toUpperCase();

  // Si no hay cambio de rol, no aplica validación de transición
  if (current === target) {
    return { valid: true };
  }

  // Si el rol destino NO requiere empleado, transición libre
  if (!requiresEmpleadoData(target)) {
    return { valid: true };
  }

  // El rol destino requiere empleado (GERENTE o EMPLEADO)
  // Verificar si ya se cuenta con id_empleado
  if (idEmpleado) {
    return { valid: true };
  }

  // NO tiene id_empleado → bloquear con señal para frontend
  return {
    valid: false,
    requiresEmpleadoData: true,
    message: `Para asignar el rol ${target} primero debe registrar los datos laborales del usuario. Complete la ficha de empleado para continuar.`,
  };
};

module.exports = {
  ROLES_REQUIEREN_EMPLEADO,
  ROLES_SIN_EMPLEADO,
  requiresEmpleadoData,
  canExistWithoutEmpleado,
  validateRoleTransition,
};
