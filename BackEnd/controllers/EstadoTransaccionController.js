// ============================================
// Controlador: EstadoTransaccionController
// CRUD para la entidad EstadoTransaccion
// ============================================

const { EstadoTransaccion } = require("../models");

const crearEstadoTransaccion = async (req, res) => {
  try {
    const estado = await EstadoTransaccion.create(req.body);
    return res.status(201).json(estado);
  } catch (error) {
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

const buscarEstadosTransaccion = async (req, res) => {
  try {
    const estados = await EstadoTransaccion.findAll();
    return res.status(200).json(estados);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

const buscarEstadoTransaccionId = async (req, res) => {
  try {
    const estado = await EstadoTransaccion.findByPk(req.params.id);
    if (!estado) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Estado de transacción con el ID proporcionado en la base de datos.` });
    }
    return res.status(200).json(estado);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

const actualizarEstadoTransaccion = async (req, res) => {
  try {
    const estado = await EstadoTransaccion.findByPk(req.params.id);
    if (!estado) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Estado de transacción con el ID proporcionado en la base de datos.` });
    }
    await estado.update(req.body);
    return res.status(200).json(estado);
  } catch (error) {
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

const eliminarEstadoTransaccion = async (req, res) => {
  try {
    const estado = await EstadoTransaccion.findByPk(req.params.id);
    if (!estado) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Estado de transacción con el ID proporcionado en la base de datos.` });
    }
    await estado.destroy();
    return res.status(200).json({ mensaje: "Estado de transacción eliminado correctamente" });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

module.exports = {
  crearEstadoTransaccion,
  buscarEstadosTransaccion,
  buscarEstadoTransaccionId,
  actualizarEstadoTransaccion,
  eliminarEstadoTransaccion,
};
