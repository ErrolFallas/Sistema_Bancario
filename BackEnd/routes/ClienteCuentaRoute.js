// ============================================
// Rutas: ClienteCuenta
// ============================================

const express = require("express");
const router = express.Router();

const {
  crearClienteCuenta,
  buscarClientesCuentas,
  buscarClienteCuentaId,
  eliminarClienteCuenta,
  actualizarClienteCuenta,
} = require("../controllers/ClienteCuentaController");

router.post("/", crearClienteCuenta);
router.get("/", buscarClientesCuentas);
router.get("/:id", buscarClienteCuentaId);
router.delete("/:id", eliminarClienteCuenta);
router.patch("/:id", actualizarClienteCuenta);

module.exports = router;
