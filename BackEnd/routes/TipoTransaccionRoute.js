// ============================================
// Rutas: TipoTransaccion
// ============================================

const express = require("express");
const router = express.Router();

const {
  crearTipoTransaccion,
  buscarTiposTransaccion,
  buscarTipoTransaccionId,
  eliminarTipoTransaccion,
  actualizarTipoTransaccion,
} = require("../controllers/TipoTransaccionController");

router.post("/", crearTipoTransaccion);
router.get("/", buscarTiposTransaccion);
router.get("/:id", buscarTipoTransaccionId);
router.delete("/:id", eliminarTipoTransaccion);
router.patch("/:id", actualizarTipoTransaccion);

module.exports = router;
