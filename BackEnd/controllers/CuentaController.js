// ============================================
// Controlador: CuentaController
// CRUD para la entidad Cuenta
// ============================================

const { Cuenta, Banco, TipoCuenta } = require("../models");

const crearCuenta = async (req, res) => {
  try {
    const cuenta = await Cuenta.create(req.body);
    return res.status(201).json(cuenta);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const buscarCuentas = async (req, res) => {
  try {
    const cuentas = await Cuenta.findAll({
      include: [
        { model: Banco, as: "banco" },
        { model: TipoCuenta, as: "tipoCuenta" },
      ],
    });
    return res.status(200).json(cuentas);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const buscarCuentaId = async (req, res) => {
  try {
    const cuenta = await Cuenta.findByPk(req.params.id, {
      include: [
        { model: Banco, as: "banco" },
        { model: TipoCuenta, as: "tipoCuenta" },
      ],
    });
    if (!cuenta) {
      return res.status(404).json({ error: "Cuenta no encontrada" });
    }
    return res.status(200).json(cuenta);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const actualizarCuenta = async (req, res) => {
  try {
    const cuenta = await Cuenta.findByPk(req.params.id);
    if (!cuenta) {
      return res.status(404).json({ error: "Cuenta no encontrada" });
    }
    await cuenta.update(req.body);
    return res.status(200).json(cuenta);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const eliminarCuenta = async (req, res) => {
  try {
    const cuenta = await Cuenta.findByPk(req.params.id);
    if (!cuenta) {
      return res.status(404).json({ error: "Cuenta no encontrada" });
    }
    await cuenta.destroy();
    return res.status(200).json({ mensaje: "Cuenta eliminada correctamente" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  crearCuenta,
  buscarCuentas,
  buscarCuentaId,
  actualizarCuenta,
  eliminarCuenta,
};
