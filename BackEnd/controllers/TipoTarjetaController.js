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
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

const buscarTiposTarjeta = async (req, res) => {
  try {
    const tipos = await TipoTarjeta.findAll();
    return res.status(200).json(tipos);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

const buscarTipoTarjetaId = async (req, res) => {
  try {
    const tipo = await TipoTarjeta.findByPk(req.params.id);
    if (!tipo) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Tipo de tarjeta con el ID proporcionado en la base de datos.` });
    }
    return res.status(200).json(tipo);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

const actualizarTipoTarjeta = async (req, res) => {
  try {
    const tipo = await TipoTarjeta.findByPk(req.params.id);
    if (!tipo) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Tipo de tarjeta con el ID proporcionado en la base de datos.` });
    }
    await tipo.update(req.body);
    return res.status(200).json(tipo);
  } catch (error) {
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

const eliminarTipoTarjeta = async (req, res) => {
  try {
    const tipo = await TipoTarjeta.findByPk(req.params.id);
    if (!tipo) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Tipo de tarjeta con el ID proporcionado en la base de datos.` });
    }
    await tipo.destroy();
    return res.status(200).json({ mensaje: "Tipo de tarjeta eliminado correctamente" });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

module.exports = {
  crearTipoTarjeta,
  buscarTiposTarjeta,
  buscarTipoTarjetaId,
  actualizarTipoTarjeta,
  eliminarTipoTarjeta,
};
