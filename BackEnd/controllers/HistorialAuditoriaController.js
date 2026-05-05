// ============================================
// Controlador: HistorialAuditoriaController
// CRUD para la entidad HistorialAuditoria
// ============================================

const { HistorialAuditoria, Usuario } = require("../models");

const crearHistorialAuditoria = async (req, res) => {
  try {
    const registro = await HistorialAuditoria.create(req.body);
    return res.status(201).json(registro);
  } catch (error) {
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

const buscarHistorialAuditorias = async (req, res) => {
  try {
    const registros = await HistorialAuditoria.findAll({
      include: [{ model: Usuario, as: "usuario" }],
    });
    return res.status(200).json(registros);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

const buscarHistorialAuditoriaId = async (req, res) => {
  try {
    const registro = await HistorialAuditoria.findByPk(req.params.id, {
      include: [{ model: Usuario, as: "usuario" }],
    });
    if (!registro) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Registro de auditoría con el ID proporcionado en la base de datos.` });
    }
    return res.status(200).json(registro);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

const actualizarHistorialAuditoria = async (req, res) => {
  try {
    const registro = await HistorialAuditoria.findByPk(req.params.id);
    if (!registro) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Registro de auditoría con el ID proporcionado en la base de datos.` });
    }
    await registro.update(req.body);
    return res.status(200).json(registro);
  } catch (error) {
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

const eliminarHistorialAuditoria = async (req, res) => {
  try {
    const registro = await HistorialAuditoria.findByPk(req.params.id);
    if (!registro) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Registro de auditoría con el ID proporcionado en la base de datos.` });
    }
    await registro.destroy();
    return res.status(200).json({ mensaje: "Registro de auditoría eliminado correctamente" });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

module.exports = {
  crearHistorialAuditoria,
  buscarHistorialAuditorias,
  buscarHistorialAuditoriaId,
  actualizarHistorialAuditoria,
  eliminarHistorialAuditoria,
};
