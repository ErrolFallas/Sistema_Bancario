const { ROLES } = require('../constants/roles');

/**
 * Verifica si el usuario actual tiene derecho a acceder al recurso.
 * Un usuario tiene derecho si:
 * 1. Es SUPER_ADMIN o ADMIN.
 * 2. Es el propietario del recurso (su ID coincide con el ID solicitado).
 * 
 * @param {Object} reqUser - Usuario proveniente del middleware autenticarToken
 * @param {String|Number} resourceId - ID del recurso solicitado
 * @param {String} ownerIdField - Nombre del campo de ownership (ej: 'idUsuario' o 'idCliente')
 * @returns {Boolean}
 */
const tieneDerechoAcceso = (reqUser, resourceId, ownerIdField = 'idUsuario') => {
  if (!reqUser) return false;

  // Los roles administrativos tienen acceso total
  if ([ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(reqUser.rol)) {
    return true;
  }

  // Verificar ownership
  // Comparamos el ID solicitado con el ID del usuario en el token
  const userIdFromToken = reqUser[ownerIdField];
  
  // Convertir ambos a string para comparación segura
  return String(userIdFromToken) === String(resourceId);
};

module.exports = {
  tieneDerechoAcceso
};
