// ============================================
// Rutas: Cuenta
// ============================================

const express = require("express");
const router = express.Router();

const { autenticarToken } = require('../middlewares/autenticarToken');
const { verificarRol } = require('../middlewares/verificarRol');
const { verificarPropiedad } = require('../middlewares/verificarPropiedad');


const {
  crearCuenta,
  buscarCuentas,
  buscarCuentaId,
  eliminarCuenta,
  actualizarCuenta,
} = require("../controllers/CuentaController");

router.post("/", autenticarToken, verificarRol('ADMIN', 'EMPLEADO'), crearCuenta);
router.get("/", autenticarToken, verificarRol('ADMIN', 'EMPLEADO', 'GERENTE', 'CLIENTE'), buscarCuentas);
router.get("/:id", autenticarToken, verificarRol('ADMIN', 'EMPLEADO', 'GERENTE', 'CLIENTE'), verificarPropiedad('Cuenta'), buscarCuentaId);
router.delete("/:id", autenticarToken, verificarRol('ADMIN'), verificarPropiedad('Cuenta'), eliminarCuenta);
router.patch("/:id", autenticarToken, verificarRol('ADMIN', 'EMPLEADO'), verificarPropiedad('Cuenta'), actualizarCuenta);

module.exports = router;
