// ============================================
// Rutas: Movimiento
// ============================================

const express = require("express");
const router = express.Router();

const {
  crearMovimiento,
  buscarMovimientos,
  buscarMovimientoId,
  eliminarMovimiento,
  actualizarMovimiento,
} = require("../controllers/MovimientoController");

router.post("/", crearMovimiento);
router.get("/", buscarMovimientos);
router.get("/:id", buscarMovimientoId);
router.delete("/:id", eliminarMovimiento);
router.patch("/:id", actualizarMovimiento);

module.exports = router;
