/**
 * Role Helpers — Jerarquía RBAC Centralizada
 * ────────────────────────────────────────────
 * Centraliza toda la lógica de roles, jerarquía y badges
 * para evitar duplicación entre componentes.
 *
 * Jerarquía: SUPER_ADMIN > ADMIN > GERENTE > EMPLEADO > CLIENTE
 */

// ── Jerarquía numérica de roles ─────────────────────────────
export const ROLE_HIERARCHY = {
  SUPER_ADMIN: 5,
  ADMIN: 4,
  GERENTE: 3,
  EMPLEADO: 2,
  CLIENTE: 1,
};

// ── Constantes de agrupación ────────────────────────────────
export const STAFF_ROLES = ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'EMPLEADO'];
export const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN'];
export const MANAGEMENT_ROLES = ['SUPER_ADMIN', 'ADMIN', 'GERENTE'];
export const ALL_ROLES = ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'EMPLEADO', 'CLIENTE'];

// Roles base protegidos del sistema (no se pueden eliminar)
export const PROTECTED_ROLES = ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'EMPLEADO', 'CLIENTE'];

/**
 * Verifica si el rol del usuario tiene acceso a una lista de roles requeridos.
 * SUPER_ADMIN siempre tiene acceso.
 * @param {string} userRole - Rol del usuario autenticado
 * @param {string[]} requiredRoles - Roles permitidos para la acción
 * @returns {boolean}
 */
export const canAccess = (userRole, requiredRoles) => {
  if (!userRole) return false;
  const upper = userRole.toUpperCase();
  if (upper === 'SUPER_ADMIN') return true;
  return requiredRoles.map(r => r.toUpperCase()).includes(upper);
};

/**
 * Verifica si un rol puede modificar/actuar sobre otro rol (jerarquía).
 * Un rol solo puede modificar roles de nivel inferior.
 * @param {string} actorRole - Rol del usuario que ejecuta la acción
 * @param {string} targetRole - Rol del usuario objetivo
 * @returns {boolean}
 */
export const canModify = (actorRole, targetRole) => {
  if (!actorRole || !targetRole) return false;
  const actorLevel = ROLE_HIERARCHY[actorRole.toUpperCase()] || 0;
  const targetLevel = ROLE_HIERARCHY[targetRole.toUpperCase()] || 0;
  return actorLevel > targetLevel;
};

/**
 * Retorna la clase CSS del badge según el nombre del rol.
 * Centraliza la lógica que antes estaba duplicada en GestionUsuarios y GestionRoles.
 * @param {string} roleName
 * @returns {string}
 */
export const getBadgeClass = (roleName) => {
  if (!roleName) return 'badge-admin';
  const upper = roleName.toUpperCase();
  if (upper === 'SUPER_ADMIN' || upper === 'ADMIN') return 'badge-admin';
  if (upper === 'CLIENTE') return 'badge-cliente';
  if (upper === 'EMPLEADO' || upper === 'GERENTE') return 'badge-empleado';
  return 'badge-admin'; // Roles custom
};

/**
 * Retorna una etiqueta amigable para el rol.
 * @param {string} roleName
 * @returns {string}
 */
export const getRoleLabel = (roleName) => {
  if (!roleName) return 'Sin rol';
  const labels = {
    SUPER_ADMIN: 'Super Administrador',
    ADMIN: 'Administrador',
    GERENTE: 'Gerente',
    EMPLEADO: 'Empleado',
    CLIENTE: 'Cliente',
  };
  return labels[roleName.toUpperCase()] || roleName;
};

/**
 * Determina si un rol es de tipo "staff" (no cliente).
 * @param {string} roleName
 * @returns {boolean}
 */
export const isStaffRole = (roleName) => {
  return STAFF_ROLES.includes(roleName?.toUpperCase());
};

/**
 * Determina si un rol es de tipo "admin".
 * @param {string} roleName
 * @returns {boolean}
 */
export const isAdminRole = (roleName) => {
  return ADMIN_ROLES.includes(roleName?.toUpperCase());
};

/**
 * Determina si un rol es protegido (rol base del sistema).
 * @param {string} roleName
 * @returns {boolean}
 */
export const isProtectedRole = (roleName) => {
  return PROTECTED_ROLES.includes(roleName?.toUpperCase());
};
