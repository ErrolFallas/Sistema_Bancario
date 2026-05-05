// ============================================
// Controlador: TarjetaController
// CRUD para la entidad Tarjeta
// ============================================

const { Tarjeta, Cuenta, TipoTarjeta, MarcaTarjeta, EstadoTarjeta } = require("../models");

const crearTarjeta = async (req, res) => {
  try {
    const tarjeta = await Tarjeta.create(req.body);
    return res.status(201).json(tarjeta);
  } catch (error) {
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

const buscarTarjetas = async (req, res) => {
  try {
    const tarjetas = await Tarjeta.findAll({
      include: [
        { model: Cuenta, as: "cuenta" },
        { model: TipoTarjeta, as: "tipoTarjeta" },
        { model: MarcaTarjeta, as: "marcaTarjeta" },
        { model: EstadoTarjeta, as: "estadoTarjeta" },
      ],
    });
    return res.status(200).json(tarjetas);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

const buscarTarjetaId = async (req, res) => {
  try {
    const tarjeta = await Tarjeta.findByPk(req.params.id, {
      include: [
        { model: Cuenta, as: "cuenta" },
        { model: TipoTarjeta, as: "tipoTarjeta" },
        { model: MarcaTarjeta, as: "marcaTarjeta" },
        { model: EstadoTarjeta, as: "estadoTarjeta" },
      ],
    });
    if (!tarjeta) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Tarjeta con el ID proporcionado en la base de datos.` });
    }
    return res.status(200).json(tarjeta);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

const actualizarTarjeta = async (req, res) => {
  try {
    const tarjeta = await Tarjeta.findByPk(req.params.id);
    if (!tarjeta) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Tarjeta con el ID proporcionado en la base de datos.` });
    }
    await tarjeta.update(req.body);
    return res.status(200).json(tarjeta);
  } catch (error) {
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

const eliminarTarjeta = async (req, res) => {
  try {
    const tarjeta = await Tarjeta.findByPk(req.params.id);
    if (!tarjeta) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Tarjeta con el ID proporcionado en la base de datos.` });
    }
    await tarjeta.destroy();
    return res.status(200).json({ mensaje: "Tarjeta eliminada correctamente" });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

module.exports = {
  crearTarjeta,
  buscarTarjetas,
  buscarTarjetaId,
  actualizarTarjeta,
  eliminarTarjeta,
};
