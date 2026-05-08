const { ROLES } = require('../constants/roles');

/**
 * Roles que requieren obligatoriamente un registro en EMPLEADOS.
 */
const ROLES_REQUIEREN_EMPLEADO = [ROLES.GERENTE, ROLES.EMPLEADO];

/**
 * Roles que pueden existir SIN registro en EMPLEADOS.
 */
const ROLES_SIN_EMPLEADO = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CLIENTE];

/**
 * Determina si un rol destino requiere datos de empleado.
 */
const requiresEmpleadoData = (targetRole) => {
  const role = targetRole?.trim()?.toUpperCase();
  return ROLES_REQUIEREN_EMPLEADO.includes(role);
};

/**
 * Valida si una transición de rol es posible dado el id_empleado actual o solicitado.
 */
const validateRoleTransition = (idEmpleado, currentRoleName, targetRoleName) => {
  const current = currentRoleName?.trim()?.toUpperCase();
  const target = targetRoleName?.trim()?.toUpperCase();

  // Si no hay cambio de rol, no aplica validación de transición
  if (current === target) return { valid: true };

  // Si el rol destino NO requiere empleado, transición libre
  if (!requiresEmpleadoData(target)) return { valid: true };

  // El rol destino requiere empleado (GERENTE o EMPLEADO)
  if (idEmpleado) return { valid: true };

  // NO tiene id_empleado → bloquear con señal para frontend (HTTP 422)
  return {
    valid: false,
    requiresEmpleadoData: true,
    message: `Transición de Gobernanza: El rol ${target} exige datos laborales. Por favor complete la ficha de empleado para autorizar la promoción.`,
  };
};

module.exports = {
  ROLES_REQUIEREN_EMPLEADO,
  ROLES_SIN_EMPLEADO,
  requiresEmpleadoData,
  validateRoleTransition,
};
