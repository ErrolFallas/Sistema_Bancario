// ============================================
// Controlador: TipoCuentaController
// CRUD para la entidad TipoCuenta
// ============================================

const { TipoCuenta } = require("../models");

const crearTipoCuenta = async (req, res) => {
  try {
    const tipo = await TipoCuenta.create(req.body);
    return res.status(201).json(tipo);
  } catch (error) {
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

const buscarTiposCuenta = async (req, res) => {
  try {
    const tipos = await TipoCuenta.findAll();
    return res.status(200).json(tipos);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

const buscarTipoCuentaId = async (req, res) => {
  try {
    const tipo = await TipoCuenta.findByPk(req.params.id);
    if (!tipo) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Tipo de cuenta con el ID proporcionado en la base de datos.` });
    }
    return res.status(200).json(tipo);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

const actualizarTipoCuenta = async (req, res) => {
  try {
    const tipo = await TipoCuenta.findByPk(req.params.id);
    if (!tipo) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Tipo de cuenta con el ID proporcionado en la base de datos.` });
    }
    await tipo.update(req.body);
    return res.status(200).json(tipo);
  } catch (error) {
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

const eliminarTipoCuenta = async (req, res) => {
  try {
    const tipo = await TipoCuenta.findByPk(req.params.id);
    if (!tipo) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Tipo de cuenta con el ID proporcionado en la base de datos.` });
    }
    await tipo.destroy();
    return res.status(200).json({ mensaje: "Tipo de cuenta eliminado correctamente" });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

module.exports = {
  crearTipoCuenta,
  buscarTiposCuenta,
  buscarTipoCuentaId,
  actualizarTipoCuenta,
  eliminarTipoCuenta,
};
