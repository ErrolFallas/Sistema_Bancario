// ============================================
// Controlador: RolPermisoController
// CRUD para la tabla pivote RolPermiso
// ============================================

const { RolPermiso } = require("../models");

const crearRolPermiso = async (req, res) => {
  try {
    const registro = await RolPermiso.create(req.body);
    return res.status(201).json(registro);
  } catch (error) {
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

const buscarRolesPermisos = async (req, res) => {
  try {
    const registros = await RolPermiso.findAll();
    return res.status(200).json(registros);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

const buscarRolPermisoId = async (req, res) => {
  try {
    const registro = await RolPermiso.findByPk(req.params.id);
    if (!registro) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Registro con el ID proporcionado en la base de datos.` });
    }
    return res.status(200).json(registro);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

const actualizarRolPermiso = async (req, res) => {
  try {
    const registro = await RolPermiso.findByPk(req.params.id);
    if (!registro) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Registro con el ID proporcionado en la base de datos.` });
    }
    await registro.update(req.body);
    return res.status(200).json(registro);
  } catch (error) {
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

const eliminarRolPermiso = async (req, res) => {
  try {
    const registro = await RolPermiso.findByPk(req.params.id);
    if (!registro) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Registro con el ID proporcionado en la base de datos.` });
    }
    await registro.destroy();
    return res.status(200).json({ mensaje: "Registro eliminado correctamente" });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

module.exports = {
  crearRolPermiso,
  buscarRolesPermisos,
  buscarRolPermisoId,
  actualizarRolPermiso,
  eliminarRolPermiso,
};
