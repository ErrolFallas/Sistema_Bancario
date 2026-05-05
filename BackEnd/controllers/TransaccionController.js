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
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

const buscarTransacciones = async (req, res) => {
  try {
    const opciones = {
      where: req.user && req.user.rol === 'CLIENTE' ? { idCliente: req.user.idCliente } : {},
      include: [
        { model: Cliente, as: "cliente" },
        { model: Cuenta, as: "cuentaOrigen" },
        { model: Cuenta, as: "cuentaDestino" },
        { model: Canal, as: "canal" },
        { model: TipoTransaccion, as: "tipoTransaccion" },
        { model: EstadoTransaccion, as: "estadoTransaccion" },
      ],
    };
    const transacciones = await Transaccion.findAll(opciones);
    return res.status(200).json(transacciones);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
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
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Transacción con el ID proporcionado en la base de datos.` });
    }
    return res.status(200).json(transaccion);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

const actualizarTransaccion = async (req, res) => {
  try {
    const transaccion = await Transaccion.findByPk(req.params.id);
    if (!transaccion) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Transacción con el ID proporcionado en la base de datos.` });
    }
    await transaccion.update(req.body);
    return res.status(200).json(transaccion);
  } catch (error) {
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

const eliminarTransaccion = async (req, res) => {
  return res.status(403).json({ error: 'Operación denegada. No está permitido eliminar transacciones de la base de datos por normativa financiera. Utilice un reverso lógico.' });
};

module.exports = {
  crearTransaccion,
  buscarTransacciones,
  buscarTransaccionId,
  actualizarTransaccion,
  eliminarTransaccion,
};
