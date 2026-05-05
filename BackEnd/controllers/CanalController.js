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
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

const buscarCanales = async (req, res) => {
  try {
    const canales = await Canal.findAll();
    return res.status(200).json(canales);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

const buscarCanalId = async (req, res) => {
  try {
    const canal = await Canal.findByPk(req.params.id);
    if (!canal) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Canal con el ID proporcionado en la base de datos.` });
    }
    return res.status(200).json(canal);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

const actualizarCanal = async (req, res) => {
  try {
    const canal = await Canal.findByPk(req.params.id);
    if (!canal) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Canal con el ID proporcionado en la base de datos.` });
    }
    await canal.update(req.body);
    return res.status(200).json(canal);
  } catch (error) {
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

const eliminarCanal = async (req, res) => {
  try {
    const canal = await Canal.findByPk(req.params.id);
    if (!canal) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Canal con el ID proporcionado en la base de datos.` });
    }
    await canal.destroy();
    return res.status(200).json({ mensaje: "Canal eliminado correctamente" });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

module.exports = {
  crearCanal,
  buscarCanales,
  buscarCanalId,
  actualizarCanal,
  eliminarCanal,
};
