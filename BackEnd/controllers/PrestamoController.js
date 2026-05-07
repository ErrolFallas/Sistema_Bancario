// ============================================
// Controlador: PrestamoController
// CRUD para la entidad Prestamo
// ============================================

const { Prestamo, Cliente, Banco, EstadoPrestamo } = require("../models");
const { registrarAuditoria } = require('../utils/auditoria');

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

    if (!(req.query.includeInactive === 'true' && req.user && ['SUPER_ADMIN', 'ADMIN'].includes(req.user.rol))) {
      opciones.where.isActive = true;
    }

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

const desactivarPrestamo = async (req, res) => {
  try {
    const prestamo = await Prestamo.findByPk(req.params.id);
    if (!prestamo) return res.status(404).json({ error: 'Préstamo no encontrado.' });

    if (prestamo.isActive === false) {
      return res.status(400).json({ error: 'Operación redundante: El préstamo ya se encuentra desactivado.' });
    }

    await prestamo.update({ isActive: false });

    if (req.user) {
      await registrarAuditoria({
        idUsuario: req.user.idUsuario,
        accion: 'DESACTIVAR_PRESTAMO',
        tablaAfectada: 'PRESTAMOS',
        idRegistro: prestamo.idPrestamo,
        descripcion: `Se desactivó el préstamo con ID ${prestamo.idPrestamo}`,
        ip: req.ip,
      });
    }

    return res.status(200).json({ mensaje: 'Préstamo desactivado correctamente.' });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno.', detalle: error.message });
  }
};

const reactivarPrestamo = async (req, res) => {
  try {
    const prestamo = await Prestamo.findByPk(req.params.id);
    if (!prestamo) return res.status(404).json({ error: 'Préstamo no encontrado.' });

    if (prestamo.isActive === true) {
      return res.status(400).json({ error: 'Operación redundante: El préstamo ya se encuentra activo.' });
    }

    await prestamo.update({ isActive: true });

    if (req.user) {
      await registrarAuditoria({
        idUsuario: req.user.idUsuario,
        accion: 'REACTIVAR_PRESTAMO',
        tablaAfectada: 'PRESTAMOS',
        idRegistro: prestamo.idPrestamo,
        descripcion: `Se reactivó el préstamo con ID ${prestamo.idPrestamo}`,
        ip: req.ip,
      });
    }

    return res.status(200).json({ mensaje: 'Préstamo reactivado correctamente.' });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno.', detalle: error.message });
  }
};

module.exports = {
  crearPrestamo,
  buscarPrestamos,
  buscarPrestamoId,
  actualizarPrestamo,
  eliminarPrestamo,
  desactivarPrestamo,
  reactivarPrestamo,
};
