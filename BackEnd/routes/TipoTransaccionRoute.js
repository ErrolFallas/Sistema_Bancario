// ============================================
// Rutas: TipoTransaccion
// ============================================

const express = require("express");
const router = express.Router();

const { autenticarToken } = require('../middlewares/autenticarToken');
const { verificarRol } = require('../middlewares/verificarRol');
const { verificarPropiedad } = require('../middlewares/verificarPropiedad');


const {
  crearTipoTransaccion,
  buscarTiposTransaccion,
  buscarTipoTransaccionId,
  eliminarTipoTransaccion,
  actualizarTipoTransaccion,
} = require("../controllers/TipoTransaccionController");

router.post("/", autenticarToken, verificarRol('ADMIN'), crearTipoTransaccion);
router.get("/", autenticarToken, buscarTiposTransaccion);
router.get("/:id", autenticarToken, buscarTipoTransaccionId);
router.delete("/:id", autenticarToken, verificarRol('ADMIN'), eliminarTipoTransaccion);
router.patch("/:id", autenticarToken, verificarRol('ADMIN'), actualizarTipoTransaccion);

module.exports = router;
