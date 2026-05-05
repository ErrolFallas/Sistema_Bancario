// ============================================
// Controlador: PermisoController
// CRUD para la entidad Permiso
// ============================================

const { Permiso } = require("../models");

const crearPermiso = async (req, res) => {
  try {
    const permiso = await Permiso.create(req.body);
    return res.status(201).json(permiso);
  } catch (error) {
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

const buscarPermisos = async (req, res) => {
  try {
    const permisos = await Permiso.findAll();
    return res.status(200).json(permisos);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

const buscarPermisoId = async (req, res) => {
  try {
    const permiso = await Permiso.findByPk(req.params.id);
    if (!permiso) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Permiso con el ID proporcionado en la base de datos.` });
    }
    return res.status(200).json(permiso);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

const actualizarPermiso = async (req, res) => {
  try {
    const permiso = await Permiso.findByPk(req.params.id);
    if (!permiso) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Permiso con el ID proporcionado en la base de datos.` });
    }
    await permiso.update(req.body);
    return res.status(200).json(permiso);
  } catch (error) {
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

const eliminarPermiso = async (req, res) => {
  try {
    const permiso = await Permiso.findByPk(req.params.id);
    if (!permiso) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Permiso con el ID proporcionado en la base de datos.` });
    }
    await permiso.destroy();
    return res.status(200).json({ mensaje: "Permiso eliminado correctamente" });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

module.exports = {
  crearPermiso,
  buscarPermisos,
  buscarPermisoId,
  actualizarPermiso,
  eliminarPermiso,
};
