// ============================================
// Controlador: EstadoPrestamoController
// CRUD para la entidad EstadoPrestamo
// ============================================

const { EstadoPrestamo } = require("../models");

const crearEstadoPrestamo = async (req, res) => {
  try {
    const estado = await EstadoPrestamo.create(req.body);
    return res.status(201).json(estado);
  } catch (error) {
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

const buscarEstadosPrestamo = async (req, res) => {
  try {
    const estados = await EstadoPrestamo.findAll();
    return res.status(200).json(estados);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

const buscarEstadoPrestamoId = async (req, res) => {
  try {
    const estado = await EstadoPrestamo.findByPk(req.params.id);
    if (!estado) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Estado de préstamo con el ID proporcionado en la base de datos.` });
    }
    return res.status(200).json(estado);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

const actualizarEstadoPrestamo = async (req, res) => {
  try {
    const estado = await EstadoPrestamo.findByPk(req.params.id);
    if (!estado) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Estado de préstamo con el ID proporcionado en la base de datos.` });
    }
    await estado.update(req.body);
    return res.status(200).json(estado);
  } catch (error) {
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

const eliminarEstadoPrestamo = async (req, res) => {
  try {
    const estado = await EstadoPrestamo.findByPk(req.params.id);
    if (!estado) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Estado de préstamo con el ID proporcionado en la base de datos.` });
    }
    await estado.destroy();
    return res.status(200).json({ mensaje: "Estado de préstamo eliminado correctamente" });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

module.exports = {
  crearEstadoPrestamo,
  buscarEstadosPrestamo,
  buscarEstadoPrestamoId,
  actualizarEstadoPrestamo,
  eliminarEstadoPrestamo,
};
