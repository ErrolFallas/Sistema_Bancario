// ============================================
// Controlador: ClienteController
// CRUD para la entidad Cliente
// ============================================

const { Cliente } = require("../models");
const { registrarAuditoria, descripcionCrearCliente } = require('../utils/auditoria');

const crearCliente = async (req, res) => {
  try {
    const cliente = await Cliente.create(req.body);

    // --- AUDITORÍA AUTOMÁTICA ---
    const descripcion = await descripcionCrearCliente(req.user, cliente);
    await registrarAuditoria({
      idUsuario: req.user.idUsuario,
      accion: 'CREATE',
      tablaAfectada: 'CLIENTES',
      idRegistro: cliente.idCliente,
      descripcion,
      ip: req.ip,
    });
    // -----------------------------

    return res.status(201).json(cliente);
  } catch (error) {
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

const buscarClientes = async (req, res) => {
  try {
    const where = {};
    if (req.user && req.user.rol === 'CLIENTE') {
      where.idCliente = req.user.idCliente;
    }
    const clientes = await Cliente.findAll({ where });
    return res.status(200).json(clientes);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

const buscarClienteId = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Cliente con el ID proporcionado en la base de datos.` });
    }
    return res.status(200).json(cliente);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

const actualizarCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Cliente con el ID proporcionado en la base de datos.` });
    }
    await cliente.update(req.body);
    return res.status(200).json(cliente);
  } catch (error) {
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

const eliminarCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Cliente con el ID proporcionado en la base de datos.` });
    }
    await cliente.destroy();
    return res.status(200).json({ mensaje: "Cliente eliminado correctamente" });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

module.exports = {
  crearCliente,
  buscarClientes,
  buscarClienteId,
  actualizarCliente,
  eliminarCliente,
};
