// ============================================
// Rutas: Prestamo
// ============================================

const express = require("express");
const router = express.Router();

const { autenticarToken } = require('../middlewares/autenticarToken');
const { verificarRol } = require('../middlewares/verificarRol');
const { verificarPropiedad } = require('../middlewares/verificarPropiedad');


const {
  crearPrestamo,
  buscarPrestamos,
  buscarPrestamoId,
  eliminarPrestamo,
  actualizarPrestamo,
} = require("../controllers/PrestamoController");

router.post("/", autenticarToken, verificarRol('CLIENTE', 'EMPLEADO'), crearPrestamo);
router.get("/", autenticarToken, verificarRol('ADMIN', 'GERENTE', 'CLIENTE'), buscarPrestamos);
router.get("/:id", autenticarToken, verificarRol('ADMIN', 'GERENTE', 'CLIENTE'), verificarPropiedad('Prestamo'), buscarPrestamoId);
router.delete("/:id", autenticarToken, verificarRol('ADMIN'), verificarPropiedad('Prestamo'), eliminarPrestamo);
router.patch("/:id", autenticarToken, verificarRol('GERENTE'), verificarPropiedad('Prestamo'), actualizarPrestamo);

module.exports = router;
