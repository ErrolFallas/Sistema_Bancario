// ============================================
// Rutas: Tarjeta
// ============================================

const express = require("express");
const router = express.Router();

const { autenticarToken } = require('../middlewares/autenticarToken');
const { verificarRol } = require('../middlewares/verificarRol');
const { verificarPropiedad } = require('../middlewares/verificarPropiedad');


const {
  crearTarjeta,
  buscarTarjetas,
  buscarTarjetaId,
  eliminarTarjeta,
  actualizarTarjeta,
} = require("../controllers/TarjetaController");

router.post("/", autenticarToken, verificarRol('EMPLEADO'), crearTarjeta);
router.get("/", autenticarToken, verificarRol('ADMIN', 'EMPLEADO', 'CLIENTE'), buscarTarjetas);
router.get("/:id", autenticarToken, verificarRol('ADMIN', 'EMPLEADO', 'CLIENTE'), verificarPropiedad('Tarjeta'), buscarTarjetaId);
router.delete("/:id", autenticarToken, verificarRol('ADMIN'), verificarPropiedad('Tarjeta'), eliminarTarjeta);
router.patch("/:id", autenticarToken, verificarRol('EMPLEADO'), verificarPropiedad('Tarjeta'), actualizarTarjeta);

module.exports = router;
