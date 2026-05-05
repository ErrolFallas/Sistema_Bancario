// ============================================
// Controlador: TransaccionController
// CRUD para la entidad Transaccion
// ============================================

const {
  Transaccion,
  Cliente,
  Cuenta,
  Canal,
  TipoTransaccion,
  EstadoTransaccion,
} = require("../models");

const crearTransaccion = async (req, res) => {
  try {
    const transaccion = await Transaccion.create(req.body);
    return res.status(201).json(transaccion);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const buscarTransacciones = async (req, res) => {
  try {
    const transacciones = await Transaccion.findAll({
      include: [
        { model: Cliente, as: "cliente" },
        { model: Cuenta, as: "cuentaOrigen" },
        { model: Cuenta, as: "cuentaDestino" },
        { model: Canal, as: "canal" },
        { model: TipoTransaccion, as: "tipoTransaccion" },
        { model: EstadoTransaccion, as: "estadoTransaccion" },
      ],
    });
    return res.status(200).json(transacciones);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const buscarTransaccionId = async (req, res) => {
  try {
    const transaccion = await Transaccion.findByPk(req.params.id, {
      include: [
        { model: Cliente, as: "cliente" },
        { model: Cuenta, as: "cuentaOrigen" },
        { model: Cuenta, as: "cuentaDestino" },
        { model: Canal, as: "canal" },
        { model: TipoTransaccion, as: "tipoTransaccion" },
        { model: EstadoTransaccion, as: "estadoTransaccion" },
      ],
    });
    if (!transaccion) {
      return res.status(404).json({ error: "Transacción no encontrada" });
    }
    return res.status(200).json(transaccion);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const actualizarTransaccion = async (req, res) => {
  try {
    const transaccion = await Transaccion.findByPk(req.params.id);
    if (!transaccion) {
      return res.status(404).json({ error: "Transacción no encontrada" });
    }
    await transaccion.update(req.body);
    return res.status(200).json(transaccion);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const eliminarTransaccion = async (req, res) => {
  try {
    const transaccion = await Transaccion.findByPk(req.params.id);
    if (!transaccion) {
      return res.status(404).json({ error: "Transacción no encontrada" });
    }
    await transaccion.destroy();
    return res.status(200).json({ mensaje: "Transacción eliminada correctamente" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  crearTransaccion,
  buscarTransacciones,
  buscarTransaccionId,
  actualizarTransaccion,
  eliminarTransaccion,
};
