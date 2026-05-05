// ============================================
// Controlador: CanalController
// CRUD para la entidad Canal
// ============================================

const { Canal } = require("../models");

const crearCanal = async (req, res) => {
  try {
    const canal = await Canal.create(req.body);
    return res.status(201).json(canal);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const buscarCanales = async (req, res) => {
  try {
    const canales = await Canal.findAll();
    return res.status(200).json(canales);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const buscarCanalId = async (req, res) => {
  try {
    const canal = await Canal.findByPk(req.params.id);
    if (!canal) {
      return res.status(404).json({ error: "Canal no encontrado" });
    }
    return res.status(200).json(canal);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const actualizarCanal = async (req, res) => {
  try {
    const canal = await Canal.findByPk(req.params.id);
    if (!canal) {
      return res.status(404).json({ error: "Canal no encontrado" });
    }
    await canal.update(req.body);
    return res.status(200).json(canal);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const eliminarCanal = async (req, res) => {
  try {
    const canal = await Canal.findByPk(req.params.id);
    if (!canal) {
      return res.status(404).json({ error: "Canal no encontrado" });
    }
    await canal.destroy();
    return res.status(200).json({ mensaje: "Canal eliminado correctamente" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  crearCanal,
  buscarCanales,
  buscarCanalId,
  actualizarCanal,
  eliminarCanal,
};
