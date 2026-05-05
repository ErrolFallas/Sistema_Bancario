// ============================================
// Rutas: MarcaTarjeta
// ============================================

const express = require("express");
const router = express.Router();

const {
  crearMarcaTarjeta,
  buscarMarcasTarjeta,
  buscarMarcaTarjetaId,
  eliminarMarcaTarjeta,
  actualizarMarcaTarjeta,
} = require("../controllers/MarcaTarjetaController");

router.post("/", crearMarcaTarjeta);
router.get("/", buscarMarcasTarjeta);
router.get("/:id", buscarMarcaTarjetaId);
router.delete("/:id", eliminarMarcaTarjeta);
router.patch("/:id", actualizarMarcaTarjeta);

module.exports = router;
