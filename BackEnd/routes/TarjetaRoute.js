// ============================================
// Rutas: Tarjeta
// ============================================

const express = require("express");
const router = express.Router();

const {
  crearTarjeta,
  buscarTarjetas,
  buscarTarjetaId,
  eliminarTarjeta,
  actualizarTarjeta,
} = require("../controllers/TarjetaController");

router.post("/", crearTarjeta);
router.get("/", buscarTarjetas);
router.get("/:id", buscarTarjetaId);
router.delete("/:id", eliminarTarjeta);
router.patch("/:id", actualizarTarjeta);

module.exports = router;
