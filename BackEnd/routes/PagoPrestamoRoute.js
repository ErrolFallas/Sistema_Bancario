// ============================================
// Rutas: PagoPrestamo
// ============================================

const express = require("express");
const router = express.Router();

const {
  crearPagoPrestamo,
  buscarPagosPrestamo,
  buscarPagoPrestamoId,
  eliminarPagoPrestamo,
  actualizarPagoPrestamo,
} = require("../controllers/PagoPrestamoController");

router.post("/", crearPagoPrestamo);
router.get("/", buscarPagosPrestamo);
router.get("/:id", buscarPagoPrestamoId);
router.delete("/:id", eliminarPagoPrestamo);
router.patch("/:id", actualizarPagoPrestamo);

module.exports = router;
