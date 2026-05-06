// ============================================
// Controlador: RolController
// CRUD para la entidad Rol
// ============================================

const { Rol, Permiso, Usuario } = require("../models");

// Roles protegidos del sistema — no se pueden eliminar ni renombrar
const ROLES_PROTEGIDOS = ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'EMPLEADO', 'CLIENTE'];

const crearRol = async (req, res) => {
  try {
    const rol = await Rol.create(req.body);
    return res.status(201).json(rol);
  } catch (error) {
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

const buscarRoles = async (req, res) => {
  try {
    const roles = await Rol.findAll({
      include: [{ model: Permiso, as: "permisos" }],
    });
    return res.status(200).json(roles);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

const buscarRolId = async (req, res) => {
  try {
    const rol = await Rol.findByPk(req.params.id, {
      include: [{ model: Permiso, as: "permisos" }],
    });
    if (!rol) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Rol con el ID proporcionado en la base de datos.` });
    }
    return res.status(200).json(rol);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

const actualizarRol = async (req, res) => {
  try {
    const rol = await Rol.findByPk(req.params.id);
    if (!rol) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Rol con el ID proporcionado en la base de datos.` });
    }

    // Proteger roles base: no se puede cambiar el nombre de un rol protegido
    if (ROLES_PROTEGIDOS.includes(rol.nombre.toUpperCase()) && req.body.nombre) {
      return res.status(403).json({ error: `Operación denegada: El rol '${rol.nombre}' es un rol base del sistema y su nombre no puede ser modificado.` });
    }

    await rol.update(req.body);
    return res.status(200).json(rol);
  } catch (error) {
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

const eliminarRol = async (req, res) => {
  try {
    const rol = await Rol.findByPk(req.params.id);
    if (!rol) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Rol con el ID proporcionado en la base de datos.` });
    }

    // No permitir eliminar roles base del sistema
    if (ROLES_PROTEGIDOS.includes(rol.nombre.toUpperCase())) {
      return res.status(403).json({ error: `Operación denegada: El rol '${rol.nombre}' es un rol base del sistema y no puede ser eliminado.` });
    }

    // Verificar si hay usuarios con este rol asignado
    const usuariosConRol = await Usuario.count({ where: { idRol: rol.idRol } });
    if (usuariosConRol > 0) {
      return res.status(400).json({ error: `No se puede eliminar el rol '${rol.nombre}' porque tiene ${usuariosConRol} usuario(s) asignado(s). Reasigne los usuarios a otro rol primero.` });
    }

    await rol.destroy();
    return res.status(200).json({ mensaje: "Rol eliminado correctamente" });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

module.exports = {
  crearRol,
  buscarRoles,
  buscarRolId,
  actualizarRol,
  eliminarRol,
};
