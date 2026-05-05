// ============================================
// Rutas: Movimiento
// ============================================

const express = require("express");
const router = express.Router();

const { autenticarToken } = require('../middlewares/autenticarToken');
const { verificarRol } = require('../middlewares/verificarRol');
const { verificarPropiedad } = require('../middlewares/verificarPropiedad');


const {
  crearMovimiento,
  buscarMovimientos,
  buscarMovimientoId,
  eliminarMovimiento,
  actualizarMovimiento,
} = require("../controllers/MovimientoController");

router.post("/", autenticarToken, (req,res)=>res.status(403).json({error:'Acceso denegado.'}), crearMovimiento);
router.get("/", autenticarToken, verificarRol('ADMIN', 'AUDITOR', 'GERENTE'), buscarMovimientos);
router.get("/:id", autenticarToken, verificarRol('ADMIN', 'AUDITOR', 'GERENTE'), buscarMovimientoId);
router.delete("/:id", autenticarToken, (req,res)=>res.status(403).json({error:'Acceso denegado.'}), eliminarMovimiento);
router.patch("/:id", autenticarToken, (req,res)=>res.status(403).json({error:'Acceso denegado.'}), actualizarMovimiento);

module.exports = router;
