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
 */
export const canAccess = (userRole, requiredRoles) => {
  if (!userRole) return false;
  const upper = userRole.toUpperCase();
  if (upper === 'SUPER_ADMIN') return true;
  return requiredRoles.map(r => r.toUpperCase()).includes(upper);
};

/**
 * REGLA DE CREACIÓN: Jerarquía Bancaria
 * Define qué roles puede crear el usuario según su propio rol.
 */
export const canCreate = (actorRole, targetRole) => {
  if (!actorRole || !targetRole) return false;
  const actor = actorRole.toUpperCase();
  const target = targetRole.toUpperCase();

  if (actor === 'SUPER_ADMIN') return true;
  
  // Matriz de gobernanza oficial:
  // ADMIN no puede crear ADMIN ni SUPER_ADMIN
  if (actor === 'ADMIN') return ['GERENTE', 'EMPLEADO', 'CLIENTE'].includes(target);
  
  if (actor === 'GERENTE') return ['EMPLEADO', 'CLIENTE'].includes(target);
  if (actor === 'EMPLEADO') return target === 'CLIENTE';
  return false;
};

/**
 * REGLA DE MODIFICACIÓN: Jerarquía Estricta
 * Determina si el actor puede realizar operaciones sobre el objetivo.
 */
export const canModify = (actorRole, targetRole, isSelf = false) => {
  if (!actorRole || !targetRole) return false;
  const actor = actorRole.toUpperCase();
  const target = targetRole.toUpperCase();

  // Regla de Auto-modificación:
  // Siempre permitida excepto devaluaciones críticas validadas en backend.
  if (isSelf) return true;

  const actorLevel = ROLE_HIERARCHY[actor] || 0;
  const targetLevel = ROLE_HIERARCHY[target] || 0;

  // SUPER_ADMIN puede actuar sobre otros SUPER_ADMIN (sujeto a seniority en backend)
  if (actor === 'SUPER_ADMIN' && target === 'SUPER_ADMIN') return true;

  // El actor debe ser de nivel superior al objetivo
  return actorLevel > targetLevel;
};

/**
 * REGLA DE SENIORITY: Protección SUPER_ADMIN
 * Determina si el actor tiene antigüedad suficiente para actuar sobre el objetivo.
 * Regla: Solo aplica sobre OTROS Super Admins.
 */
export const hasSeniority = (actor, target) => {
  if (!actor || !target) return true;
  
  // Si no son ambos SUPER_ADMIN, no aplica seniority
  if (actor.rol !== 'SUPER_ADMIN' || target.rol !== 'SUPER_ADMIN') return true;
  
  // Auto-gestión: Un Super Admin siempre tiene "seniority" sobre sí mismo
  if (actor.idUsuario === target.idUsuario) return true;
  
  if (!actor.created_at || !target.created_at) return true;
  
  const actorDate = new Date(actor.created_at);
  const targetDate = new Date(target.created_at);
  
  // Actor debe ser más antiguo (menor o igual fecha) que el objetivo
  return actorDate <= targetDate;
};

/**
 * Retorna la clase CSS del badge según el nombre del rol.
 */
export const getBadgeClass = (roleName) => {
  if (!roleName) return 'badge-admin';
  const upper = roleName.toUpperCase();
  if (upper === 'SUPER_ADMIN' || upper === 'ADMIN') return 'badge-admin';
  if (upper === 'CLIENTE') return 'badge-cliente';
  if (upper === 'EMPLEADO' || upper === 'GERENTE') return 'badge-empleado';
  return 'badge-admin';
};

/**
 * Retorna una etiqueta amigable para el rol.
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

export const isStaffRole = (roleName) => STAFF_ROLES.includes(roleName?.toUpperCase());
export const isAdminRole = (roleName) => ADMIN_ROLES.includes(roleName?.toUpperCase());
export const isProtectedRole = (roleName) => PROTECTED_ROLES.includes(roleName?.toUpperCase());
