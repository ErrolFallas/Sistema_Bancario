// ============================================
// Controlador: ClienteCuentaController
// CRUD para la tabla pivote ClienteCuenta
// ============================================

const { ClienteCuenta } = require("../models");

const crearClienteCuenta = async (req, res) => {
  try {
    const registro = await ClienteCuenta.create(req.body);
    return res.status(201).json(registro);
  } catch (error) {
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

const buscarClientesCuentas = async (req, res) => {
  try {
    const registros = await ClienteCuenta.findAll();
    return res.status(200).json(registros);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

const buscarClienteCuentaId = async (req, res) => {
  try {
    const registro = await ClienteCuenta.findByPk(req.params.id);
    if (!registro) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Registro con el ID proporcionado en la base de datos.` });
    }
    return res.status(200).json(registro);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

const actualizarClienteCuenta = async (req, res) => {
  try {
    const registro = await ClienteCuenta.findByPk(req.params.id);
    if (!registro) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Registro con el ID proporcionado en la base de datos.` });
    }
    await registro.update(req.body);
    return res.status(200).json(registro);
  } catch (error) {
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

const eliminarClienteCuenta = async (req, res) => {
  try {
    const registro = await ClienteCuenta.findByPk(req.params.id);
    if (!registro) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Registro con el ID proporcionado en la base de datos.` });
    }
    await registro.destroy();
    return res.status(200).json({ mensaje: "Registro eliminado correctamente" });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

module.exports = {
  crearClienteCuenta,
  buscarClientesCuentas,
  buscarClienteCuentaId,
  actualizarClienteCuenta,
  eliminarClienteCuenta,
};
