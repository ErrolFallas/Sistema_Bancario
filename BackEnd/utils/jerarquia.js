// ============================================
// Utilidad: jerarquia.js
// Lógica de jerarquía estricta de RBAC
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
 * Verifica si el rol de origen tiene permisos sobre el rol destino.
 * Regla: Ningún rol puede modificar a un usuario de igual o mayor jerarquía.
 * (Excepto SUPER_ADMIN que sí puede editar a otro SUPER_ADMIN si es necesario,
 * o a sí mismo).
 * 
 * @param {string} rolOrigen Nombre del rol que ejecuta la acción
 * @param {string} rolDestino Nombre del rol sobre el cual se ejecuta la acción
 * @returns {boolean} true si tiene permiso, false en caso contrario
 */
const puedeModificar = (rolOrigen, rolDestino) => {
  const pesoOrigen = JERARQUIA[rolOrigen] || 0;
  const pesoDestino = JERARQUIA[rolDestino] || 0;

  if (rolOrigen === 'SUPER_ADMIN') {
    return true; // El Super Admin tiene control total
  }

  // Para el resto de roles, el peso de quien ejecuta debe ser MAYOR al peso del afectado
  return pesoOrigen > pesoDestino;
};

module.exports = {
  JERARQUIA,
  puedeModificar
};
