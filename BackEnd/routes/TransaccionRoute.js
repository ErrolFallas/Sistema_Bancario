// ============================================
// Rutas: Transaccion
// ============================================

const express = require("express");
const router = express.Router();

const {
  crearTransaccion,
  buscarTransacciones,
  buscarTransaccionId,
  eliminarTransaccion,
  actualizarTransaccion,
} = require("../controllers/TransaccionController");

router.post("/", crearTransaccion);
router.get("/", buscarTransacciones);
router.get("/:id", buscarTransaccionId);
router.delete("/:id", eliminarTransaccion);
router.patch("/:id", actualizarTransaccion);

module.exports = router;
