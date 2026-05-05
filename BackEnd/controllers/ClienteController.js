// ============================================
// Controlador: ClienteController
// CRUD para la entidad Cliente
// ============================================

const { Cliente } = require("../models");

const crearCliente = async (req, res) => {
  try {
    const cliente = await Cliente.create(req.body);
    return res.status(201).json(cliente);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const buscarClientes = async (req, res) => {
  try {
    const clientes = await Cliente.findAll();
    return res.status(200).json(clientes);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const buscarClienteId = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }
    return res.status(200).json(cliente);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const actualizarCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }
    await cliente.update(req.body);
    return res.status(200).json(cliente);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const eliminarCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }
    await cliente.destroy();
    return res.status(200).json({ mensaje: "Cliente eliminado correctamente" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  crearCliente,
  buscarClientes,
  buscarClienteId,
  actualizarCliente,
  eliminarCliente,
};
