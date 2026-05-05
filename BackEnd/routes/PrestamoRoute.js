// ============================================
// Rutas: Prestamo
// ============================================

const express = require("express");
const router = express.Router();

const {
  crearPrestamo,
  buscarPrestamos,
  buscarPrestamoId,
  eliminarPrestamo,
  actualizarPrestamo,
} = require("../controllers/PrestamoController");

router.post("/", crearPrestamo);
router.get("/", buscarPrestamos);
router.get("/:id", buscarPrestamoId);
router.delete("/:id", eliminarPrestamo);
router.patch("/:id", actualizarPrestamo);

module.exports = router;
