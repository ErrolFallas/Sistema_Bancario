// ============================================
// Controlador: PagoPrestamoController
// CRUD para la entidad PagoPrestamo
// ============================================

const { PagoPrestamo, Prestamo, Transaccion } = require("../models");

const crearPagoPrestamo = async (req, res) => {
  try {
    const pago = await PagoPrestamo.create(req.body);
    return res.status(201).json(pago);
  } catch (error) {
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

const buscarPagosPrestamo = async (req, res) => {
  try {
    const pagos = await PagoPrestamo.findAll({
      include: [
        { model: Prestamo, as: "prestamo" },
        { model: Transaccion, as: "transaccion" },
      ],
    });
    return res.status(200).json(pagos);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

const buscarPagoPrestamoId = async (req, res) => {
  try {
    const pago = await PagoPrestamo.findByPk(req.params.id, {
      include: [
        { model: Prestamo, as: "prestamo" },
        { model: Transaccion, as: "transaccion" },
      ],
    });
    if (!pago) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Pago de préstamo con el ID proporcionado en la base de datos.` });
    }
    return res.status(200).json(pago);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

const actualizarPagoPrestamo = async (req, res) => {
  try {
    const pago = await PagoPrestamo.findByPk(req.params.id);
    if (!pago) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Pago de préstamo con el ID proporcionado en la base de datos.` });
    }
    await pago.update(req.body);
    return res.status(200).json(pago);
  } catch (error) {
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

const eliminarPagoPrestamo = async (req, res) => {
  try {
    const pago = await PagoPrestamo.findByPk(req.params.id);
    if (!pago) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Pago de préstamo con el ID proporcionado en la base de datos.` });
    }
    await pago.destroy();
    return res.status(200).json({ mensaje: "Pago de préstamo eliminado correctamente" });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

module.exports = {
  crearPagoPrestamo,
  buscarPagosPrestamo,
  buscarPagoPrestamoId,
  actualizarPagoPrestamo,
  eliminarPagoPrestamo,
};
