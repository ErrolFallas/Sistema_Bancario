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
    return res.status(400).json({ error: error.message });
  }
};

// Obtener todos los bancos
const buscarBancos = async (req, res) => {
  try {
    const bancos = await Banco.findAll();
    return res.status(200).json(bancos);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Obtener un banco por ID
const buscarBancoId = async (req, res) => {
  try {
    const banco = await Banco.findByPk(req.params.id);
    if (!banco) {
      return res.status(404).json({ error: "Banco no encontrado" });
    }
    return res.status(200).json(banco);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Actualizar un banco
const actualizarBanco = async (req, res) => {
  try {
    const banco = await Banco.findByPk(req.params.id);
    if (!banco) {
      return res.status(404).json({ error: "Banco no encontrado" });
    }
    await banco.update(req.body);
    return res.status(200).json(banco);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Eliminar un banco
const eliminarBanco = async (req, res) => {
  try {
    const banco = await Banco.findByPk(req.params.id);
    if (!banco) {
      return res.status(404).json({ error: "Banco no encontrado" });
    }
    await banco.destroy();
    return res.status(200).json({ mensaje: "Banco eliminado correctamente" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  crearBanco,
  buscarBancos,
  buscarBancoId,
  actualizarBanco,
  eliminarBanco,
};
