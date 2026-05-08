// ============================================
// Utilidad: auditoria.js
// Helper reutilizable para auditoría automática
// ============================================

const { HistorialAuditoria, Empleado, Cliente } = require('../models');

/**
 * Construye una descripción del creador basada en req.user.
 */
const construirPrefijo = async (reqUser, t = null) => {
  if (!reqUser) return 'El sistema';

  const { username, rol, idEmpleado } = reqUser;

  if (idEmpleado) {
    try {
      const empleado = await Empleado.findByPk(idEmpleado, { transaction: t });
      if (empleado) {
        return `El empleado ${empleado.nombre} ${empleado.apellido} (rol: ${rol})`;
      }
    } catch { }
  }

  return `El ${rol} ${username}`;
};

/**
 * Genera descripción para creación de usuario.
 */
const descripcionCrearUsuario = async (reqUser, usuario, nombreRol, t = null) => {
  const prefijo = await construirPrefijo(reqUser, t);

  if (nombreRol === 'CLIENTE' && usuario.idCliente) {
    try {
      const cliente = await Cliente.findByPk(usuario.idCliente, { transaction: t });
      if (cliente) {
        return `${prefijo} creó el usuario ${usuario.username} asociado al cliente ${cliente.nombre} ${cliente.apellido}`;
      }
    } catch { }
    return `${prefijo} creó el usuario ${usuario.username} con rol CLIENTE`;
  }

  if ((nombreRol === 'EMPLEADO' || nombreRol === 'GERENTE') && usuario.idEmpleado) {
    try {
      const empleado = await Empleado.findByPk(usuario.idEmpleado, { transaction: t });
      if (empleado) {
        return `${prefijo} creó el usuario ${usuario.username} con rol ${nombreRol} (Emp: ${empleado.nombre})`;
      }
    } catch { }
  }

  return `${prefijo} creó el usuario ${usuario.username} con rol ${nombreRol}`;
};

const descripcionCrearCliente = async (reqUser, cliente, t = null) => {
  const prefijo = await construirPrefijo(reqUser, t);
  return `${prefijo} creó el cliente ${cliente.nombre} ${cliente.apellido}`;
};

const descripcionCrearEmpleado = async (reqUser, empleado, t = null) => {
  const prefijo = await construirPrefijo(reqUser, t);
  return `${prefijo} creó el empleado ${empleado.nombre} ${empleado.apellido}`;
};

/**
 * Registra una acción en HISTORIAL_AUDITORIA.
 */
const registrarAuditoria = async ({ idUsuario, accion, tablaAfectada, idRegistro, descripcion, ip }, t = null) => {
  try {
    return await HistorialAuditoria.create({
      idUsuario: idUsuario || null,
      accion,
      tablaAfectada,
      idRegistro,
      descripcion,
      ip: ip || null,
    }, { transaction: t });
  } catch (error) {
    console.error('[AUDITORIA] Error:', error.message);
    return null;
  }
};

/**
 * Simplifica el registro de auditoría extrayendo datos del request de forma automática.
 */
const auditRequest = async (req, { accion, tablaAfectada, idRegistro, descripcion }, t = null) => {
  return await registrarAuditoria({
    idUsuario: req.user?.idUsuario,
    accion,
    tablaAfectada,
    idRegistro,
    descripcion,
    ip: req.ip,
  }, t);
};

module.exports = {
  registrarAuditoria,
  auditRequest,
  descripcionCrearUsuario,
  descripcionCrearCliente,
  descripcionCrearEmpleado,
};
