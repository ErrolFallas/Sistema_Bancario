// ============================================
// Controlador: MarcaTarjetaController
// CRUD para la entidad MarcaTarjeta
// ============================================

const { MarcaTarjeta } = require("../models");

const crearMarcaTarjeta = async (req, res) => {
  try {
    const marca = await MarcaTarjeta.create(req.body);
    return res.status(201).json(marca);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const buscarMarcasTarjeta = async (req, res) => {
  try {
    const marcas = await MarcaTarjeta.findAll();
    return res.status(200).json(marcas);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const buscarMarcaTarjetaId = async (req, res) => {
  try {
    const marca = await MarcaTarjeta.findByPk(req.params.id);
    if (!marca) {
      return res.status(404).json({ error: "Marca de tarjeta no encontrada" });
    }
    return res.status(200).json(marca);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const actualizarMarcaTarjeta = async (req, res) => {
  try {
    const marca = await MarcaTarjeta.findByPk(req.params.id);
    if (!marca) {
      return res.status(404).json({ error: "Marca de tarjeta no encontrada" });
    }
    await marca.update(req.body);
    return res.status(200).json(marca);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const eliminarMarcaTarjeta = async (req, res) => {
  try {
    const marca = await MarcaTarjeta.findByPk(req.params.id);
    if (!marca) {
      return res.status(404).json({ error: "Marca de tarjeta no encontrada" });
    }
    await marca.destroy();
    return res.status(200).json({ mensaje: "Marca de tarjeta eliminada correctamente" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  crearMarcaTarjeta,
  buscarMarcasTarjeta,
  buscarMarcaTarjetaId,
  actualizarMarcaTarjeta,
  eliminarMarcaTarjeta,
};
