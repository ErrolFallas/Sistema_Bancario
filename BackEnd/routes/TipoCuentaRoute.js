// ============================================
// Rutas: TipoCuenta
// ============================================

const express = require("express");
const router = express.Router();

const { autenticarToken } = require('../middlewares/autenticarToken');
const { verificarRol } = require('../middlewares/verificarRol');
const { verificarPropiedad } = require('../middlewares/verificarPropiedad');


const {
  crearTipoCuenta,
  buscarTiposCuenta,
  buscarTipoCuentaId,
  eliminarTipoCuenta,
  actualizarTipoCuenta,
} = require("../controllers/TipoCuentaController");

router.post("/", autenticarToken, verificarRol('ADMIN'), crearTipoCuenta);
router.get("/", autenticarToken, buscarTiposCuenta);
router.get("/:id", autenticarToken, buscarTipoCuentaId);
router.delete("/:id", autenticarToken, verificarRol('ADMIN'), eliminarTipoCuenta);
router.patch("/:id", autenticarToken, verificarRol('ADMIN'), actualizarTipoCuenta);

module.exports = router;
