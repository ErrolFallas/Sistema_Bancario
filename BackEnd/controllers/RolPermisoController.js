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
    return res.status(400).json({ error: error.message });
  }
};

const buscarRolesPermisos = async (req, res) => {
  try {
    const registros = await RolPermiso.findAll();
    return res.status(200).json(registros);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const buscarRolPermisoId = async (req, res) => {
  try {
    const registro = await RolPermiso.findByPk(req.params.id);
    if (!registro) {
      return res.status(404).json({ error: "Registro no encontrado" });
    }
    return res.status(200).json(registro);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const actualizarRolPermiso = async (req, res) => {
  try {
    const registro = await RolPermiso.findByPk(req.params.id);
    if (!registro) {
      return res.status(404).json({ error: "Registro no encontrado" });
    }
    await registro.update(req.body);
    return res.status(200).json(registro);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const eliminarRolPermiso = async (req, res) => {
  try {
    const registro = await RolPermiso.findByPk(req.params.id);
    if (!registro) {
      return res.status(404).json({ error: "Registro no encontrado" });
    }
    await registro.destroy();
    return res.status(200).json({ mensaje: "Registro eliminado correctamente" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  crearRolPermiso,
  buscarRolesPermisos,
  buscarRolPermisoId,
  actualizarRolPermiso,
  eliminarRolPermiso,
};
