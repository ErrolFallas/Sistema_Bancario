// ============================================
// Controlador: BancoController
// CRUD para la entidad Banco
// ============================================

const { Banco } = require("../models");

// Crear un nuevo banco
const crearBanco = async (req, res) => {
  try {
    const banco = await Banco.create(req.body);
    return res.status(201).json(banco);
  } catch (error) {
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

// Obtener todos los bancos
const buscarBancos = async (req, res) => {
  try {
    const bancos = await Banco.findAll();
    return res.status(200).json(bancos);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

// Obtener un banco por ID
const buscarBancoId = async (req, res) => {
  try {
    const banco = await Banco.findByPk(req.params.id);
    if (!banco) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Banco con el ID proporcionado en la base de datos.` });
    }
    return res.status(200).json(banco);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

// Actualizar un banco
const actualizarBanco = async (req, res) => {
  try {
    const banco = await Banco.findByPk(req.params.id);
    if (!banco) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Banco con el ID proporcionado en la base de datos.` });
    }
    await banco.update(req.body);
    return res.status(200).json(banco);
  } catch (error) {
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

// Eliminar un banco
const eliminarBanco = async (req, res) => {
  try {
    const banco = await Banco.findByPk(req.params.id);
    if (!banco) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Banco con el ID proporcionado en la base de datos.` });
    }
    await banco.destroy();
    return res.status(200).json({ mensaje: "Banco eliminado correctamente" });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

module.exports = {
  crearBanco,
  buscarBancos,
  buscarBancoId,
  actualizarBanco,
  eliminarBanco,
};
