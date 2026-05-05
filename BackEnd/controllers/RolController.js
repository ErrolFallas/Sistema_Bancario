// ============================================
// Controlador: RolController
// CRUD para la entidad Rol
// ============================================

const { Rol, Permiso } = require("../models");

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
