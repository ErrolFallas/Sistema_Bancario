// ============================================
// Rutas: TipoCuenta
// ============================================

const express = require("express");
const router = express.Router();

const {
  crearTipoCuenta,
  buscarTiposCuenta,
  buscarTipoCuentaId,
  eliminarTipoCuenta,
  actualizarTipoCuenta,
} = require("../controllers/TipoCuentaController");

router.post("/", crearTipoCuenta);
router.get("/", buscarTiposCuenta);
router.get("/:id", buscarTipoCuentaId);
router.delete("/:id", eliminarTipoCuenta);
router.patch("/:id", actualizarTipoCuenta);

module.exports = router;
