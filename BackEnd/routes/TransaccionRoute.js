// ============================================
// Rutas: Transaccion
// ============================================

const express = require("express");
const router = express.Router();

const { autenticarToken } = require('../middlewares/autenticarToken');
const { verificarRol } = require('../middlewares/verificarRol');
const { verificarPropiedad } = require('../middlewares/verificarPropiedad');


const {
  crearTransaccion,
  buscarTransacciones,
  buscarTransaccionId,
  eliminarTransaccion,
  actualizarTransaccion,
} = require("../controllers/TransaccionController");

router.post("/", autenticarToken, verificarRol('CLIENTE', 'CAJERO'), crearTransaccion);
router.get("/", autenticarToken, verificarRol('ADMIN', 'EMPLEADO', 'GERENTE', 'CLIENTE'), buscarTransacciones);
router.get("/:id", autenticarToken, verificarRol('ADMIN', 'EMPLEADO', 'GERENTE', 'CLIENTE'), verificarPropiedad('Transaccion'), buscarTransaccionId);
router.delete("/:id", autenticarToken, (req,res)=>res.status(403).json({error:'Acceso denegado.'}), eliminarTransaccion);
router.patch("/:id", autenticarToken, (req,res)=>res.status(403).json({error:'Acceso denegado.'}), actualizarTransaccion);

module.exports = router;
