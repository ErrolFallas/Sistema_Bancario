// ============================================
// Controlador: CuentaController
// CRUD para la entidad Cuenta
// ============================================

const { Cuenta, Banco, TipoCuenta, ClienteCuenta, Cliente } = require("../models");
const { registrarAuditoria } = require('../utils/auditoria');

// ============================================
// Función auxiliar: generar número de cuenta automático
// Formato: CR-YYYYMMDD-XXXX (ej: CR-20260505-4821)
// ============================================
const generarNumeroCuenta = () => {
  const hoy = new Date();
  const fecha = hoy.toISOString().slice(0, 10).replace(/-/g, '');
  const aleatorio = Math.floor(1000 + Math.random() * 9000); // 4 dígitos
  return `CR-${fecha}-${aleatorio}`;
};

// ============================================
// POST /cuentas — Crear cuenta
// Regla: DEBE venir id_cliente o id_empleado
// ============================================
const crearCuenta = async (req, res) => {
  try {
    const { idCliente, idEmpleado, ...datosCuenta } = req.body;

    // ── Validación obligatoria ──────────────────────────────────────
    if (!idCliente && !idEmpleado) {
      return res.status(400).json({
        error: 'Error de validación: Se requiere obligatoriamente enviar el "id_cliente" o el "id_empleado" para poder crear una cuenta y asociarla.',
      });
    }

    // ── Auto-generar número de cuenta si no viene en el body ────────
    if (!datosCuenta.numeroCuenta) {
      datosCuenta.numeroCuenta = generarNumeroCuenta();
    }

    // ── Crear la cuenta ─────────────────────────────────────────────
    const cuenta = await Cuenta.create(datosCuenta);

    // ── Si viene id_cliente, registrar en tabla intermedia ──────────
    if (idCliente) {
      await ClienteCuenta.create({
        idCuenta: cuenta.idCuenta,
        idCliente: idCliente,
      });
    }

    // ── Respuesta con número de cuenta generado ─────────────────────
    return res.status(201).json({
      ...cuenta.toJSON(),
      numeroCuenta: cuenta.numeroCuenta,
      idCliente: idCliente || null,
      idEmpleado: idEmpleado || null,
    });
  } catch (error) {
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

// ============================================
// GET /cuentas — Listar todas las cuentas
// ============================================
const buscarCuentas = async (req, res) => {
  try {
    const opciones = {
      include: [
        { model: Banco, as: "banco" },
        { model: TipoCuenta, as: "tipoCuenta" },
        { 
          model: Cliente, 
          as: "clientes",
          ...(req.user && req.user.rol === 'CLIENTE' ? { where: { idCliente: req.user.idCliente } } : {})
        },
      ],
      where: {}
    };

    if (!(req.query.includeInactive === 'true' && req.user && ['SUPER_ADMIN', 'ADMIN'].includes(req.user.rol))) {
      opciones.where.isActive = true;
    }

    const cuentas = await Cuenta.findAll(opciones);
    return res.status(200).json(cuentas);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

// ============================================
// GET /cuentas/:id — Buscar cuenta por ID
// ============================================
const buscarCuentaId = async (req, res) => {
  try {
    const cuenta = await Cuenta.findByPk(req.params.id, {
      include: [
        { model: Banco, as: "banco" },
        { model: TipoCuenta, as: "tipoCuenta" },
        { model: Cliente, as: "clientes" },
      ],
    });
    if (!cuenta) {
      return res.status(404).json({ error: `Error de búsqueda: No se encontró ninguna cuenta asociada al ID '${req.params.id}' en el sistema.` });
    }
    return res.status(200).json(cuenta);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

// ============================================
// PATCH /cuentas/:id — Actualizar cuenta
// ============================================
const actualizarCuenta = async (req, res) => {
  try {
    const cuenta = await Cuenta.findByPk(req.params.id);
    if (!cuenta) {
      return res.status(404).json({ error: `Error de actualización: No se puede actualizar. No se encontró la cuenta con ID '${req.params.id}'.` });
    }
    await cuenta.update(req.body);
    return res.status(200).json(cuenta);
  } catch (error) {
    return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalle: error.message });
  }
};

// ============================================
// DELETE /cuentas/:id — Eliminar cuenta
// ============================================
const eliminarCuenta = async (req, res) => {
  try {
    const cuenta = await Cuenta.findByPk(req.params.id);
    if (!cuenta) {
      return res.status(404).json({ error: `Error de eliminación: No se puede eliminar. No se encontró la cuenta con ID '${req.params.id}'.` });
    }
    await cuenta.destroy();
    return res.status(200).json({ mensaje: "Cuenta eliminada correctamente" });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.', detalle: error.message });
  }
};

const desactivarCuenta = async (req, res) => {
  try {
    const cuenta = await Cuenta.findByPk(req.params.id);
    if (!cuenta) return res.status(404).json({ error: 'Cuenta no encontrada.' });

    if (cuenta.isActive === false) {
      return res.status(400).json({ error: 'Operación redundante: La cuenta ya se encuentra desactivada.' });
    }

    await cuenta.update({ isActive: false });

    if (req.user) {
      await registrarAuditoria({
        idUsuario: req.user.idUsuario,
        accion: 'DESACTIVAR_CUENTA',
        tablaAfectada: 'CUENTAS',
        idRegistro: cuenta.idCuenta,
        descripcion: `Se desactivó la cuenta ${cuenta.numeroCuenta}`,
        ip: req.ip,
      });
    }

    return res.status(200).json({ mensaje: 'Cuenta desactivada correctamente.' });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno.', detalle: error.message });
  }
};

const reactivarCuenta = async (req, res) => {
  try {
    const cuenta = await Cuenta.findByPk(req.params.id);
    if (!cuenta) return res.status(404).json({ error: 'Cuenta no encontrada.' });

    if (cuenta.isActive === true) {
      return res.status(400).json({ error: 'Operación redundante: La cuenta ya se encuentra activa.' });
    }

    await cuenta.update({ isActive: true });

    if (req.user) {
      await registrarAuditoria({
        idUsuario: req.user.idUsuario,
        accion: 'REACTIVAR_CUENTA',
        tablaAfectada: 'CUENTAS',
        idRegistro: cuenta.idCuenta,
        descripcion: `Se reactivó la cuenta ${cuenta.numeroCuenta}`,
        ip: req.ip,
      });
    }

    return res.status(200).json({ mensaje: 'Cuenta reactivada correctamente.' });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno.', detalle: error.message });
  }
};

module.exports = {
  crearCuenta,
  buscarCuentas,
  buscarCuentaId,
  actualizarCuenta,
  eliminarCuenta,
  desactivarCuenta,
  reactivarCuenta,
};
