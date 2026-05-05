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
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

const buscarMarcasTarjeta = async (req, res) => {
  try {
    const marcas = await MarcaTarjeta.findAll();
    return res.status(200).json(marcas);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

const buscarMarcaTarjetaId = async (req, res) => {
  try {
    const marca = await MarcaTarjeta.findByPk(req.params.id);
    if (!marca) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Marca de tarjeta con el ID proporcionado en la base de datos.` });
    }
    return res.status(200).json(marca);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

const actualizarMarcaTarjeta = async (req, res) => {
  try {
    const marca = await MarcaTarjeta.findByPk(req.params.id);
    if (!marca) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Marca de tarjeta con el ID proporcionado en la base de datos.` });
    }
    await marca.update(req.body);
    return res.status(200).json(marca);
  } catch (error) {
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

const eliminarMarcaTarjeta = async (req, res) => {
  try {
    const marca = await MarcaTarjeta.findByPk(req.params.id);
    if (!marca) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Marca de tarjeta con el ID proporcionado en la base de datos.` });
    }
    await marca.destroy();
    return res.status(200).json({ mensaje: "Marca de tarjeta eliminada correctamente" });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

module.exports = {
  crearMarcaTarjeta,
  buscarMarcasTarjeta,
  buscarMarcaTarjetaId,
  actualizarMarcaTarjeta,
  eliminarMarcaTarjeta,
};
