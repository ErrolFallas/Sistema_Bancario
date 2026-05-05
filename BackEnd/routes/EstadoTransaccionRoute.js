// ============================================
// Rutas: EstadoTransaccion
// ============================================

const express = require("express");
const router = express.Router();

const {
  crearEstadoTransaccion,
  buscarEstadosTransaccion,
  buscarEstadoTransaccionId,
  eliminarEstadoTransaccion,
  actualizarEstadoTransaccion,
} = require("../controllers/EstadoTransaccionController");

router.post("/", crearEstadoTransaccion);
router.get("/", buscarEstadosTransaccion);
router.get("/:id", buscarEstadoTransaccionId);
router.delete("/:id", eliminarEstadoTransaccion);
router.patch("/:id", actualizarEstadoTransaccion);

module.exports = router;
