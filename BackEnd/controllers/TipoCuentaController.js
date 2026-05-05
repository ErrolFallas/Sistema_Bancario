// ============================================
// Controlador: TipoCuentaController
// CRUD para la entidad TipoCuenta
// ============================================

const { TipoCuenta } = require("../models");

const crearTipoCuenta = async (req, res) => {
  try {
    const tipo = await TipoCuenta.create(req.body);
    return res.status(201).json(tipo);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const buscarTiposCuenta = async (req, res) => {
  try {
    const tipos = await TipoCuenta.findAll();
    return res.status(200).json(tipos);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const buscarTipoCuentaId = async (req, res) => {
  try {
    const tipo = await TipoCuenta.findByPk(req.params.id);
    if (!tipo) {
      return res.status(404).json({ error: "Tipo de cuenta no encontrado" });
    }
    return res.status(200).json(tipo);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const actualizarTipoCuenta = async (req, res) => {
  try {
    const tipo = await TipoCuenta.findByPk(req.params.id);
    if (!tipo) {
      return res.status(404).json({ error: "Tipo de cuenta no encontrado" });
    }
    await tipo.update(req.body);
    return res.status(200).json(tipo);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const eliminarTipoCuenta = async (req, res) => {
  try {
    const tipo = await TipoCuenta.findByPk(req.params.id);
    if (!tipo) {
      return res.status(404).json({ error: "Tipo de cuenta no encontrado" });
    }
    await tipo.destroy();
    return res.status(200).json({ mensaje: "Tipo de cuenta eliminado correctamente" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  crearTipoCuenta,
  buscarTiposCuenta,
  buscarTipoCuentaId,
  actualizarTipoCuenta,
  eliminarTipoCuenta,
};
