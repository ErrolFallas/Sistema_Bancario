// ============================================
// Rutas: EstadoTarjeta
// ============================================

const express = require("express");
const router = express.Router();

const { autenticarToken } = require('../middlewares/autenticarToken');
const { verificarRol } = require('../middlewares/verificarRol');
const { verificarPropiedad } = require('../middlewares/verificarPropiedad');


const {
  crearEstadoTarjeta,
  buscarEstadosTarjeta,
  buscarEstadoTarjetaId,
  eliminarEstadoTarjeta,
  actualizarEstadoTarjeta,
} = require("../controllers/EstadoTarjetaController");

router.post("/", autenticarToken, verificarRol('ADMIN'), crearEstadoTarjeta);
router.get("/", autenticarToken, buscarEstadosTarjeta);
router.get("/:id", autenticarToken, buscarEstadoTarjetaId);
router.delete("/:id", autenticarToken, verificarRol('ADMIN'), eliminarEstadoTarjeta);
router.patch("/:id", autenticarToken, verificarRol('ADMIN'), actualizarEstadoTarjeta);

module.exports = router;
