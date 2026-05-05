// ============================================
// Controlador: MovimientoController
// CRUD para la entidad Movimiento
// ============================================

const { Movimiento, Cuenta, Transaccion } = require("../models");

const crearMovimiento = async (req, res) => {
  try {
    const movimiento = await Movimiento.create(req.body);
    return res.status(201).json(movimiento);
  } catch (error) {
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

const buscarMovimientos = async (req, res) => {
  try {
    const movimientos = await Movimiento.findAll({
      include: [
        { model: Cuenta, as: "cuenta" },
        { model: Transaccion, as: "transaccion" },
      ],
    });
    return res.status(200).json(movimientos);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

const buscarMovimientoId = async (req, res) => {
  try {
    const movimiento = await Movimiento.findByPk(req.params.id, {
      include: [
        { model: Cuenta, as: "cuenta" },
        { model: Transaccion, as: "transaccion" },
      ],
    });
    if (!movimiento) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Movimiento con el ID proporcionado en la base de datos.` });
    }
    return res.status(200).json(movimiento);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

const actualizarMovimiento = async (req, res) => {
  try {
    const movimiento = await Movimiento.findByPk(req.params.id);
    if (!movimiento) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Movimiento con el ID proporcionado en la base de datos.` });
    }
    await movimiento.update(req.body);
    return res.status(200).json(movimiento);
  } catch (error) {
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

const eliminarMovimiento = async (req, res) => {
  try {
    const movimiento = await Movimiento.findByPk(req.params.id);
    if (!movimiento) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Movimiento con el ID proporcionado en la base de datos.` });
    }
    await movimiento.destroy();
    return res.status(200).json({ mensaje: "Movimiento eliminado correctamente" });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

module.exports = {
  crearMovimiento,
  buscarMovimientos,
  buscarMovimientoId,
  actualizarMovimiento,
  eliminarMovimiento,
};
