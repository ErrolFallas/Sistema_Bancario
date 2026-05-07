// ============================================
// Controlador: BancoController
// CRUD para la entidad Banco
// ============================================

const { Banco } = require("../models");
const { registrarAuditoria } = require('../utils/auditoria');

// Crear un nuevo banco
const crearBanco = async (req, res) => {
  try {
    const banco = await Banco.create(req.body);
    return res.status(201).json(banco);
  } catch (error) {
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

// Obtener todos los bancos
const buscarBancos = async (req, res) => {
  try {
    const opciones = { where: {} };
    if (!(req.query.includeInactive === 'true' && req.user && ['SUPER_ADMIN', 'ADMIN'].includes(req.user.rol))) {
      opciones.where.isActive = true;
    }
    const bancos = await Banco.findAll(opciones);
    return res.status(200).json(bancos);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

// Obtener un banco por ID
const buscarBancoId = async (req, res) => {
  try {
    const banco = await Banco.findByPk(req.params.id);
    if (!banco) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Banco con el ID proporcionado en la base de datos.` });
    }
    return res.status(200).json(banco);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

// Actualizar un banco
const actualizarBanco = async (req, res) => {
  try {
    const banco = await Banco.findByPk(req.params.id);
    if (!banco) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Banco con el ID proporcionado en la base de datos.` });
    }
    await banco.update(req.body);
    return res.status(200).json(banco);
  } catch (error) {
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

// Eliminar un banco
const eliminarBanco = async (req, res) => {
  try {
    const banco = await Banco.findByPk(req.params.id);
    if (!banco) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró el registro de Banco con el ID proporcionado en la base de datos.` });
    }
    await banco.destroy();
    return res.status(200).json({ mensaje: "Banco eliminado correctamente" });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

const desactivarBanco = async (req, res) => {
  try {
    const banco = await Banco.findByPk(req.params.id);
    if (!banco) return res.status(404).json({ error: 'Banco no encontrado.' });

    if (banco.isActive === false) {
      return res.status(400).json({ error: 'Operación redundante: El banco ya se encuentra desactivado.' });
    }

    await banco.update({ isActive: false });

    if (req.user) {
      await registrarAuditoria({
        idUsuario: req.user.idUsuario,
        accion: 'DESACTIVAR_BANCO',
        tablaAfectada: 'BANCOS',
        idRegistro: banco.idBanco,
        descripcion: `Se desactivó el banco ${banco.nombre}`,
        ip: req.ip,
      });
    }

    return res.status(200).json({ mensaje: 'Banco desactivado correctamente.' });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno.', detalle: error.message });
  }
};

const reactivarBanco = async (req, res) => {
  try {
    const banco = await Banco.findByPk(req.params.id);
    if (!banco) return res.status(404).json({ error: 'Banco no encontrado.' });

    if (banco.isActive === true) {
      return res.status(400).json({ error: 'Operación redundante: El banco ya se encuentra activo.' });
    }

    await banco.update({ isActive: true });

    if (req.user) {
      await registrarAuditoria({
        idUsuario: req.user.idUsuario,
        accion: 'REACTIVAR_BANCO',
        tablaAfectada: 'BANCOS',
        idRegistro: banco.idBanco,
        descripcion: `Se reactivó el banco ${banco.nombre}`,
        ip: req.ip,
      });
    }

    return res.status(200).json({ mensaje: 'Banco reactivado correctamente.' });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno.', detalle: error.message });
  }
};

module.exports = {
  crearBanco,
  buscarBancos,
  buscarBancoId,
  actualizarBanco,
  eliminarBanco,
  desactivarBanco,
  reactivarBanco,
};
