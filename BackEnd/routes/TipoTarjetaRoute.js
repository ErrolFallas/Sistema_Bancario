// ============================================
// Rutas: TipoTarjeta
// ============================================

const express = require("express");
const router = express.Router();

const {
  crearTipoTarjeta,
  buscarTiposTarjeta,
  buscarTipoTarjetaId,
  eliminarTipoTarjeta,
  actualizarTipoTarjeta,
} = require("../controllers/TipoTarjetaController");

router.post("/", crearTipoTarjeta);
router.get("/", buscarTiposTarjeta);
router.get("/:id", buscarTipoTarjetaId);
router.delete("/:id", eliminarTipoTarjeta);
router.patch("/:id", actualizarTipoTarjeta);

module.exports = router;
