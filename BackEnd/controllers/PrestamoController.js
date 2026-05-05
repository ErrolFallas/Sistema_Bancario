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
    return res.status(400).json({ error: error.message });
  }
};

const buscarPrestamos = async (req, res) => {
  try {
    const prestamos = await Prestamo.findAll({
      include: [
        { model: Cliente, as: "cliente" },
        { model: Banco, as: "banco" },
        { model: EstadoPrestamo, as: "estadoPrestamo" },
      ],
    });
    return res.status(200).json(prestamos);
  } catch (error) {
    return res.status(500).json({ error: error.message });
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
      return res.status(404).json({ error: "Préstamo no encontrado" });
    }
    return res.status(200).json(prestamo);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const actualizarPrestamo = async (req, res) => {
  try {
    const prestamo = await Prestamo.findByPk(req.params.id);
    if (!prestamo) {
      return res.status(404).json({ error: "Préstamo no encontrado" });
    }
    await prestamo.update(req.body);
    return res.status(200).json(prestamo);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const eliminarPrestamo = async (req, res) => {
  try {
    const prestamo = await Prestamo.findByPk(req.params.id);
    if (!prestamo) {
      return res.status(404).json({ error: "Préstamo no encontrado" });
    }
    await prestamo.destroy();
    return res.status(200).json({ mensaje: "Préstamo eliminado correctamente" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  crearPrestamo,
  buscarPrestamos,
  buscarPrestamoId,
  actualizarPrestamo,
  eliminarPrestamo,
};
