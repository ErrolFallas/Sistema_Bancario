// ============================================
// Rutas: TipoTarjeta
// ============================================

const express = require("express");
const router = express.Router();

const { autenticarToken } = require('../middlewares/autenticarToken');
const { verificarRol } = require('../middlewares/verificarRol');
const { verificarPropiedad } = require('../middlewares/verificarPropiedad');


const {
  crearTipoTarjeta,
  buscarTiposTarjeta,
  buscarTipoTarjetaId,
  eliminarTipoTarjeta,
  actualizarTipoTarjeta,
} = require("../controllers/TipoTarjetaController");

router.post("/", autenticarToken, verificarRol('ADMIN'), crearTipoTarjeta);
router.get("/", autenticarToken, buscarTiposTarjeta);
router.get("/:id", autenticarToken, buscarTipoTarjetaId);
router.delete("/:id", autenticarToken, verificarRol('ADMIN'), eliminarTipoTarjeta);
router.patch("/:id", autenticarToken, verificarRol('ADMIN'), actualizarTipoTarjeta);

module.exports = router;
