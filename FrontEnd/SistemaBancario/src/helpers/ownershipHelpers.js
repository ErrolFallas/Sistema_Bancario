/**
 * Ownership Helpers — Filtrado y Protección por Propiedad
 * ────────────────────────────────────────────────────────
 * RBAC ≠ Ownership.
 *
 * RBAC controla QUÉ acciones puede hacer un rol.
 * Ownership controla SOBRE QUÉ datos puede actuar.
 *
 * El backend ya filtra por ownership en verificarPropiedad.js.
 * Estos helpers complementan con filtrado visual y consumo inteligente.
 */

import { ADMIN_ROLES } from './roleHelpers';

/**
 * Determina si el usuario autenticado es dueño de un recurso.
 * @param {object} user - Usuario autenticado del AuthContext
 * @param {number|null} resourceClientId - idCliente del recurso
 * @param {number|null} resourceEmployeeId - idEmpleado del recurso
 * @returns {boolean}
 */
export const isOwner = (user, resourceClientId, resourceEmployeeId) => {
  if (!user) return false;

  // Admins pueden ver todo
  if (ADMIN_ROLES.includes(user.rol?.toUpperCase())) return true;

  // CLIENTE: dueño si su idCliente coincide
  if (user.idCliente && resourceClientId) {
    return user.idCliente === resourceClientId;
  }

  // EMPLEADO/GERENTE: dueño si su idEmpleado coincide
  if (user.idEmpleado && resourceEmployeeId) {
    return user.idEmpleado === resourceEmployeeId;
  }

  return false;
};

/**
 * Determina si el usuario actual debe ver solo sus propios datos.
 * @param {object} user - Usuario autenticado
 * @returns {boolean}
 */
export const isOwnershipRestricted = (user) => {
  if (!user) return true;
  return user.rol?.toUpperCase() === 'CLIENTE';
};

/**
 * Genera parámetros de query para filtrar por ownership en las peticiones API.
 * Para ADMIN+: no agrega filtros (ve todo).
 * Para CLIENTE: el backend filtra automáticamente por el JWT.
 * @param {object} user
 * @param {object} extraParams - Parámetros adicionales
 * @returns {object}
 */
export const getOwnershipParams = (user, extraParams = {}) => {
  const params = { ...extraParams };

  // ADMIN/SUPER_ADMIN pueden solicitar incluir inactivos
  if (ADMIN_ROLES.includes(user?.rol?.toUpperCase())) {
    // El param includeInactive se agrega solo cuando el componente lo solicita
  }

  return params;
};

/**
 * Filtra un array de datos localmente según ownership del usuario.
 * Útil como segunda capa de seguridad visual (el backend ya filtra).
 * @param {Array} data - Array de objetos a filtrar
 * @param {object} user - Usuario autenticado
 * @param {string} ownerField - Campo que contiene el ID del dueño (ej: 'idCliente')
 * @returns {Array}
 */
export const filterByOwnership = (data, user, ownerField = 'idCliente') => {
  if (!data || !Array.isArray(data)) return [];
  if (!user) return [];

  // Admins y Gerentes ven todo
  if (ADMIN_ROLES.includes(user.rol?.toUpperCase()) || user.rol?.toUpperCase() === 'GERENTE') {
    return data;
  }

  // CLIENTE: solo sus registros
  if (user.rol?.toUpperCase() === 'CLIENTE' && user.idCliente) {
    return data.filter(item => {
      // Soporte para relaciones anidadas (ej: item.clientes[].idCliente)
      if (Array.isArray(item.clientes)) {
        return item.clientes.some(c => c.idCliente === user.idCliente);
      }
      return item[ownerField] === user.idCliente;
    });
  }

  // EMPLEADO: el backend ya filtra
  return data;
};

/**
 * Determina qué columnas de una tabla debe ver cada rol.
 * Los CLIENTES no ven IDs internos ni datos de otros clientes.
 * @param {string} userRole - Rol del usuario
 * @param {string[]} allColumns - Todas las columnas disponibles
 * @param {string[]} sensitiveColumns - Columnas que solo ven admins
 * @returns {string[]}
 */
export const getVisibleColumns = (userRole, allColumns, sensitiveColumns = []) => {
  if (!userRole) return [];
  if (ADMIN_ROLES.includes(userRole.toUpperCase())) return allColumns;

  return allColumns.filter(col => !sensitiveColumns.includes(col));
};
