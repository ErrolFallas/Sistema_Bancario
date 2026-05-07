// ============================================
// Controlador: TarjetaController
// CRUD para la entidad Tarjeta
// ============================================

const { Tarjeta, Cuenta, TipoTarjeta, MarcaTarjeta, EstadoTarjeta, Cliente } = require("../models");
const { registrarAuditoria } = require('../utils/auditoria');

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
    const opciones = {
      include: [
        { 
          model: Cuenta, 
          as: "cuenta",
          include: req.user && req.user.rol === 'CLIENTE' ? [{
            model: Cliente,
            as: "clientes",
            where: { idCliente: req.user.idCliente }
          }] : []
        },
        { model: TipoTarjeta, as: "tipoTarjeta" },
        { model: MarcaTarjeta, as: "marcaTarjeta" },
        { model: EstadoTarjeta, as: "estadoTarjeta" },
      ],
      where: {}
    };

    if (!(req.query.includeInactive === 'true' && req.user && ['SUPER_ADMIN', 'ADMIN'].includes(req.user.rol))) {
      opciones.where.isActive = true;
    }

    const tarjetas = await Tarjeta.findAll(opciones);
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

const desactivarTarjeta = async (req, res) => {
  try {
    const tarjeta = await Tarjeta.findByPk(req.params.id);
    if (!tarjeta) return res.status(404).json({ error: 'Tarjeta no encontrada.' });

    if (tarjeta.isActive === false) {
      return res.status(400).json({ error: 'Operación redundante: La tarjeta ya se encuentra desactivada.' });
    }

    await tarjeta.update({ isActive: false });

    if (req.user) {
      await registrarAuditoria({
        idUsuario: req.user.idUsuario,
        accion: 'DESACTIVAR_TARJETA',
        tablaAfectada: 'TARJETAS',
        idRegistro: tarjeta.idTarjeta,
        descripcion: `Se desactivó la tarjeta con ID ${tarjeta.idTarjeta}`,
        ip: req.ip,
      });
    }

    return res.status(200).json({ mensaje: 'Tarjeta desactivada correctamente.' });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno.', detalle: error.message });
  }
};

const reactivarTarjeta = async (req, res) => {
  try {
    const tarjeta = await Tarjeta.findByPk(req.params.id);
    if (!tarjeta) return res.status(404).json({ error: 'Tarjeta no encontrada.' });

    if (tarjeta.isActive === true) {
      return res.status(400).json({ error: 'Operación redundante: La tarjeta ya se encuentra activa.' });
    }

    await tarjeta.update({ isActive: true });

    if (req.user) {
      await registrarAuditoria({
        idUsuario: req.user.idUsuario,
        accion: 'REACTIVAR_TARJETA',
        tablaAfectada: 'TARJETAS',
        idRegistro: tarjeta.idTarjeta,
        descripcion: `Se reactivó la tarjeta con ID ${tarjeta.idTarjeta}`,
        ip: req.ip,
      });
    }

    return res.status(200).json({ mensaje: 'Tarjeta reactivada correctamente.' });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno.', detalle: error.message });
  }
};

module.exports = {
  crearTarjeta,
  buscarTarjetas,
  buscarTarjetaId,
  actualizarTarjeta,
  eliminarTarjeta,
  desactivarTarjeta,
  reactivarTarjeta,
};
