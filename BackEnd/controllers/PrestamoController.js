// ============================================
// Controlador: PrestamoController
// CRUD para la entidad Prestamo
// ============================================

const { Prestamo, Cliente, Banco, EstadoPrestamo } = require("../models");

const crearPrestamo = async (req, res) => {
  try {
    const prestamo = await Prestamo.create(req.body);
    return res.status(201).json(prestamo);
  } catch (error) {
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

const buscarPrestamos = async (req, res) => {
  try {
    const opciones = {
      where: req.user && req.user.rol === 'CLIENTE' ? { idCliente: req.user.idCliente } : {},
      include: [
        { model: Cliente, as: "cliente" },
        { model: Banco, as: "banco" },
        { model: EstadoPrestamo, as: "estadoPrestamo" },
      ],
    };
    const prestamos = await Prestamo.findAll(opciones);
    return res.status(200).json(prestamos);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

const buscarPrestamoId = async (req, res) => {
  try {
    const prestamo = await Prestamo.findByPk(req.params.id, {
      include: [
        { model: Cliente, as: "cliente" },
        { model: Banco, as: "banco" },
        { model: EstadoPrestamo, as: "estadoPrestamo" },
      ],
    });
    if (!prestamo) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Préstamo con el ID proporcionado en la base de datos.` });
    }
    return res.status(200).json(prestamo);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

const actualizarPrestamo = async (req, res) => {
  try {
    const prestamo = await Prestamo.findByPk(req.params.id);
    if (!prestamo) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Préstamo con el ID proporcionado en la base de datos.` });
    }
    await prestamo.update(req.body);
    return res.status(200).json(prestamo);
  } catch (error) {
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

const eliminarPrestamo = async (req, res) => {
  try {
    const prestamo = await Prestamo.findByPk(req.params.id);
    if (!prestamo) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Préstamo con el ID proporcionado en la base de datos.` });
    }
    await prestamo.destroy();
    return res.status(200).json({ mensaje: "Préstamo eliminado correctamente" });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

module.exports = {
  crearPrestamo,
  buscarPrestamos,
  buscarPrestamoId,
  actualizarPrestamo,
  eliminarPrestamo,
};
