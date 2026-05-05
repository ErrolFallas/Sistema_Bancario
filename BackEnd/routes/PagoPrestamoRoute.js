// ============================================
// Rutas: PagoPrestamo
// ============================================

const express = require("express");
const router = express.Router();

const { autenticarToken } = require('../middlewares/autenticarToken');
const { verificarRol } = require('../middlewares/verificarRol');
const { verificarPropiedad } = require('../middlewares/verificarPropiedad');


const {
  crearPagoPrestamo,
  buscarPagosPrestamo,
  buscarPagoPrestamoId,
  eliminarPagoPrestamo,
  actualizarPagoPrestamo,
} = require("../controllers/PagoPrestamoController");

router.post("/", autenticarToken, verificarRol('CLIENTE'), crearPagoPrestamo);
router.get("/", autenticarToken, verificarRol('ADMIN', 'CLIENTE'), buscarPagosPrestamo);
router.get("/:id", autenticarToken, verificarRol('ADMIN', 'CLIENTE'), verificarPropiedad('PagoPrestamo'), buscarPagoPrestamoId);
router.delete("/:id", autenticarToken, (req,res)=>res.status(403).json({error:'Acceso denegado.'}), eliminarPagoPrestamo);
router.patch("/:id", autenticarToken, (req,res)=>res.status(403).json({error:'Acceso denegado.'}), actualizarPagoPrestamo);

module.exports = router;
