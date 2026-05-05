// ============================================
// Rutas: EstadoPrestamo
// ============================================

const express = require("express");
const router = express.Router();

const { autenticarToken } = require('../middlewares/autenticarToken');
const { verificarRol } = require('../middlewares/verificarRol');
const { verificarPropiedad } = require('../middlewares/verificarPropiedad');


const {
  crearEstadoPrestamo,
  buscarEstadosPrestamo,
  buscarEstadoPrestamoId,
  eliminarEstadoPrestamo,
  actualizarEstadoPrestamo,
} = require("../controllers/EstadoPrestamoController");

router.post("/", autenticarToken, verificarRol('ADMIN'), crearEstadoPrestamo);
router.get("/", autenticarToken, buscarEstadosPrestamo);
router.get("/:id", autenticarToken, buscarEstadoPrestamoId);
router.delete("/:id", autenticarToken, verificarRol('ADMIN'), eliminarEstadoPrestamo);
router.patch("/:id", autenticarToken, verificarRol('ADMIN'), actualizarEstadoPrestamo);

module.exports = router;
