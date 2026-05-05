// ============================================
// Controlador: TipoTransaccionController
// CRUD para la entidad TipoTransaccion
// ============================================

const { TipoTransaccion } = require("../models");

const crearTipoTransaccion = async (req, res) => {
  try {
    const tipo = await TipoTransaccion.create(req.body);
    return res.status(201).json(tipo);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const buscarTiposTransaccion = async (req, res) => {
  try {
    const tipos = await TipoTransaccion.findAll();
    return res.status(200).json(tipos);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const buscarTipoTransaccionId = async (req, res) => {
  try {
    const tipo = await TipoTransaccion.findByPk(req.params.id);
    if (!tipo) {
      return res.status(404).json({ error: "Tipo de transacción no encontrado" });
    }
    return res.status(200).json(tipo);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const actualizarTipoTransaccion = async (req, res) => {
  try {
    const tipo = await TipoTransaccion.findByPk(req.params.id);
    if (!tipo) {
      return res.status(404).json({ error: "Tipo de transacción no encontrado" });
    }
    await tipo.update(req.body);
    return res.status(200).json(tipo);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const eliminarTipoTransaccion = async (req, res) => {
  try {
    const tipo = await TipoTransaccion.findByPk(req.params.id);
    if (!tipo) {
      return res.status(404).json({ error: "Tipo de transacción no encontrado" });
    }
    await tipo.destroy();
    return res.status(200).json({ mensaje: "Tipo de transacción eliminado correctamente" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  crearTipoTransaccion,
  buscarTiposTransaccion,
  buscarTipoTransaccionId,
  actualizarTipoTransaccion,
  eliminarTipoTransaccion,
};
