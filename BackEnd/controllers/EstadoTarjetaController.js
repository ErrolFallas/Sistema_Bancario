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
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

const buscarEstadosTarjeta = async (req, res) => {
  try {
    const estados = await EstadoTarjeta.findAll();
    return res.status(200).json(estados);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

const buscarEstadoTarjetaId = async (req, res) => {
  try {
    const estado = await EstadoTarjeta.findByPk(req.params.id);
    if (!estado) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Estado de tarjeta con el ID proporcionado en la base de datos.` });
    }
    return res.status(200).json(estado);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

const actualizarEstadoTarjeta = async (req, res) => {
  try {
    const estado = await EstadoTarjeta.findByPk(req.params.id);
    if (!estado) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Estado de tarjeta con el ID proporcionado en la base de datos.` });
    }
    await estado.update(req.body);
    return res.status(200).json(estado);
  } catch (error) {
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

const eliminarEstadoTarjeta = async (req, res) => {
  try {
    const estado = await EstadoTarjeta.findByPk(req.params.id);
    if (!estado) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Estado de tarjeta con el ID proporcionado en la base de datos.` });
    }
    await estado.destroy();
    return res.status(200).json({ mensaje: "Estado de tarjeta eliminado correctamente" });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

module.exports = {
  crearEstadoTarjeta,
  buscarEstadosTarjeta,
  buscarEstadoTarjetaId,
  actualizarEstadoTarjeta,
  eliminarEstadoTarjeta,
};
