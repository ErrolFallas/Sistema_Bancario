// ============================================
// Rutas: Cuenta
// ============================================

const express = require("express");
const router = express.Router();

const {
  crearCuenta,
  buscarCuentas,
  buscarCuentaId,
  eliminarCuenta,
  actualizarCuenta,
} = require("../controllers/CuentaController");

router.post("/", crearCuenta);
router.get("/", buscarCuentas);
router.get("/:id", buscarCuentaId);
router.delete("/:id", eliminarCuenta);
router.patch("/:id", actualizarCuenta);

module.exports = router;
