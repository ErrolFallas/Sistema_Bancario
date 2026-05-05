// ============================================
// Rutas: EstadoTarjeta
// ============================================

const express = require("express");
const router = express.Router();

const {
  crearEstadoTarjeta,
  buscarEstadosTarjeta,
  buscarEstadoTarjetaId,
  eliminarEstadoTarjeta,
  actualizarEstadoTarjeta,
} = require("../controllers/EstadoTarjetaController");

router.post("/", crearEstadoTarjeta);
router.get("/", buscarEstadosTarjeta);
router.get("/:id", buscarEstadoTarjetaId);
router.delete("/:id", eliminarEstadoTarjeta);
router.patch("/:id", actualizarEstadoTarjeta);

module.exports = router;
