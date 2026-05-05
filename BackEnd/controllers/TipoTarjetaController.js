// ============================================
// Controlador: TipoTarjetaController
// CRUD para la entidad TipoTarjeta
// ============================================

const { TipoTarjeta } = require("../models");

const crearTipoTarjeta = async (req, res) => {
  try {
    const tipo = await TipoTarjeta.create(req.body);
    return res.status(201).json(tipo);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const buscarTiposTarjeta = async (req, res) => {
  try {
    const tipos = await TipoTarjeta.findAll();
    return res.status(200).json(tipos);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const buscarTipoTarjetaId = async (req, res) => {
  try {
    const tipo = await TipoTarjeta.findByPk(req.params.id);
    if (!tipo) {
      return res.status(404).json({ error: "Tipo de tarjeta no encontrado" });
    }
    return res.status(200).json(tipo);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const actualizarTipoTarjeta = async (req, res) => {
  try {
    const tipo = await TipoTarjeta.findByPk(req.params.id);
    if (!tipo) {
      return res.status(404).json({ error: "Tipo de tarjeta no encontrado" });
    }
    await tipo.update(req.body);
    return res.status(200).json(tipo);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const eliminarTipoTarjeta = async (req, res) => {
  try {
    const tipo = await TipoTarjeta.findByPk(req.params.id);
    if (!tipo) {
      return res.status(404).json({ error: "Tipo de tarjeta no encontrado" });
    }
    await tipo.destroy();
    return res.status(200).json({ mensaje: "Tipo de tarjeta eliminado correctamente" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  crearTipoTarjeta,
  buscarTiposTarjeta,
  buscarTipoTarjetaId,
  actualizarTipoTarjeta,
  eliminarTipoTarjeta,
};
