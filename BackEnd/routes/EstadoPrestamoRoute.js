// ============================================
// Rutas: EstadoPrestamo
// ============================================

const express = require("express");
const router = express.Router();

const {
  crearEstadoPrestamo,
  buscarEstadosPrestamo,
  buscarEstadoPrestamoId,
  eliminarEstadoPrestamo,
  actualizarEstadoPrestamo,
} = require("../controllers/EstadoPrestamoController");

router.post("/", crearEstadoPrestamo);
router.get("/", buscarEstadosPrestamo);
router.get("/:id", buscarEstadoPrestamoId);
router.delete("/:id", eliminarEstadoPrestamo);
router.patch("/:id", actualizarEstadoPrestamo);

module.exports = router;
