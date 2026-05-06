// ============================================
// Utilidad: registrarAuditoria
// Helper reutilizable para auditoría automática
// ============================================
// USO:
//   const { registrarAuditoria } = require('../utils/auditoria');
//   await registrarAuditoria({ idUsuario, accion, tablaAfectada, idRegistro, descripcion, ip });
//
// REGLAS:
//   - NUNCA lanza errores (try/catch interno)
//   - NO rompe el flujo principal del controller
//   - Inserta directamente en el modelo HistorialAuditoria
// ============================================

const { HistorialAuditoria, Empleado, Cliente } = require('../models');

/**
 * Construye una descripción del creador basada en req.user.
 * Si el creador es un empleado, busca su nombre en la BD.
 *
 * @param {Object} reqUser - El objeto req.user del JWT decodificado
 * @returns {Promise<string>} - Ej: "El empleado María López (rol: EMPLEADO)" o "El SUPER_ADMIN root"
 */
const construirPrefijo = async (reqUser) => {
  if (!reqUser) return 'El sistema';

  const { username, rol, idEmpleado } = reqUser;

  // Si el creador tiene empleado vinculado, buscar nombre
  if (idEmpleado) {
    try {
      const empleado = await Empleado.findByPk(idEmpleado);
      if (empleado) {
        return `El empleado ${empleado.nombre} ${empleado.apellido} (rol: ${rol})`;
      }
    } catch {
      // Si falla la búsqueda, usar fallback
    }
  }

  return `El ${rol} ${username}`;
};

/**
 * Construye la descripción completa de una acción de creación de USUARIO.
 *
 * @param {Object} reqUser    - req.user (creador)
 * @param {Object} usuario    - Instancia del usuario recién creado
 * @param {string} nombreRol  - Nombre del rol asignado al usuario creado
 * @returns {Promise<string>} - Descripción legible
 */
const descripcionCrearUsuario = async (reqUser, usuario, nombreRol) => {
  const prefijo = await construirPrefijo(reqUser);

  // CLIENTE → incluir nombre del cliente asociado
  if (nombreRol === 'CLIENTE' && usuario.idCliente) {
    try {
      const cliente = await Cliente.findByPk(usuario.idCliente);
      if (cliente) {
        return `${prefijo} creó el usuario ${usuario.username} asociado al cliente ${cliente.nombre} ${cliente.apellido}`;
      }
    } catch {
      // Fallback sin nombre
    }
    return `${prefijo} creó el usuario ${usuario.username} con rol CLIENTE (id_cliente: ${usuario.idCliente})`;
  }

  // EMPLEADO / GERENTE → incluir nombre del empleado asociado
  if ((nombreRol === 'EMPLEADO' || nombreRol === 'GERENTE') && usuario.idEmpleado) {
    try {
      const empleado = await Empleado.findByPk(usuario.idEmpleado);
      if (empleado) {
        return `${prefijo} creó el usuario ${usuario.username} con rol ${nombreRol} (Empleado: ${empleado.nombre} ${empleado.apellido})`;
      }
    } catch {
      // Fallback sin nombre
    }
    return `${prefijo} creó el usuario ${usuario.username} con rol ${nombreRol} (id_empleado: ${usuario.idEmpleado})`;
  }

  // ADMIN u otro rol sin relaciones
  return `${prefijo} creó el usuario ${usuario.username} con rol ${nombreRol}`;
};

/**
 * Construye la descripción para la creación de un CLIENTE.
 *
 * @param {Object} reqUser - req.user (creador)
 * @param {Object} cliente - Instancia del cliente recién creado
 * @returns {Promise<string>}
 */
const descripcionCrearCliente = async (reqUser, cliente) => {
  const prefijo = await construirPrefijo(reqUser);
  return `${prefijo} creó el cliente ${cliente.nombre} ${cliente.apellido}`;
};

/**
 * Construye la descripción para la creación de un EMPLEADO.
 *
 * @param {Object} reqUser  - req.user (creador)
 * @param {Object} empleado - Instancia del empleado recién creado
 * @returns {Promise<string>}
 */
const descripcionCrearEmpleado = async (reqUser, empleado) => {
  const prefijo = await construirPrefijo(reqUser);
  const puesto = empleado.puesto ? ` (puesto: ${empleado.puesto})` : '';
  return `${prefijo} creó el empleado ${empleado.nombre} ${empleado.apellido}${puesto}`;
};

/**
 * Registra una acción en HISTORIAL_AUDITORIA.
 * NUNCA lanza errores — el try/catch es interno.
 *
 * @param {Object} params
 * @param {number|null} params.idUsuario     - ID del usuario que ejecuta la acción
 * @param {string}      params.accion        - Tipo de acción ('CREATE', 'UPDATE', 'DELETE')
 * @param {string}      params.tablaAfectada - Nombre de la tabla ('USUARIOS', 'CLIENTES', 'EMPLEADOS')
 * @param {number}      params.idRegistro    - ID del registro creado/modificado
 * @param {string}      params.descripcion   - Descripción legible de la acción
 * @param {string|null} params.ip            - Dirección IP del cliente (opcional)
 * @returns {Promise<Object|null>} - El registro de auditoría creado, o null si falló
 */
const registrarAuditoria = async ({ idUsuario, accion, tablaAfectada, idRegistro, descripcion, ip }) => {
  try {
    const registro = await HistorialAuditoria.create({
      idUsuario: idUsuario || null,
      accion,
      tablaAfectada,
      idRegistro,
      descripcion,
      ip: ip || null,
    });
    return registro;
  } catch (error) {
    // La auditoría NUNCA debe romper el flujo principal
    console.error('[AUDITORIA] Error al registrar auditoría:', error.message);
    return null;
  }
};

module.exports = {
  registrarAuditoria,
  descripcionCrearUsuario,
  descripcionCrearCliente,
  descripcionCrearEmpleado,
};
