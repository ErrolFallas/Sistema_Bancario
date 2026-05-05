// ============================================
// Controlador: EstadoTarjetaController
// CRUD para la entidad EstadoTarjeta
// ============================================

const { EstadoTarjeta } = require("../models");

const crearEstadoTarjeta = async (req, res) => {
  try {
    const estado = await EstadoTarjeta.create(req.body);
    return res.status(201).json(estado);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const buscarEstadosTarjeta = async (req, res) => {
  try {
    const estados = await EstadoTarjeta.findAll();
    return res.status(200).json(estados);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const buscarEstadoTarjetaId = async (req, res) => {
  try {
    const estado = await EstadoTarjeta.findByPk(req.params.id);
    if (!estado) {
      return res.status(404).json({ error: "Estado de tarjeta no encontrado" });
    }
    return res.status(200).json(estado);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const actualizarEstadoTarjeta = async (req, res) => {
  try {
    const estado = await EstadoTarjeta.findByPk(req.params.id);
    if (!estado) {
      return res.status(404).json({ error: "Estado de tarjeta no encontrado" });
    }
    await estado.update(req.body);
    return res.status(200).json(estado);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const eliminarEstadoTarjeta = async (req, res) => {
  try {
    const estado = await EstadoTarjeta.findByPk(req.params.id);
    if (!estado) {
      return res.status(404).json({ error: "Estado de tarjeta no encontrado" });
    }
    await estado.destroy();
    return res.status(200).json({ mensaje: "Estado de tarjeta eliminado correctamente" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  crearEstadoTarjeta,
  buscarEstadosTarjeta,
  buscarEstadoTarjetaId,
  actualizarEstadoTarjeta,
  eliminarEstadoTarjeta,
};
