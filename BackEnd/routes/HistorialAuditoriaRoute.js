// ============================================
// Rutas: HistorialAuditoria
// ============================================

const express = require("express");
const router = express.Router();

const { autenticarToken } = require('../middlewares/autenticarToken');
const { verificarRol } = require('../middlewares/verificarRol');
const { verificarPropiedad } = require('../middlewares/verificarPropiedad');


const {
  crearHistorialAuditoria,
  buscarHistorialAuditorias,
  buscarHistorialAuditoriaId,
  eliminarHistorialAuditoria,
  actualizarHistorialAuditoria,
} = require("../controllers/HistorialAuditoriaController");

router.post("/", autenticarToken, (req,res)=>res.status(403).json({error:'Acceso denegado.'}), crearHistorialAuditoria);
router.get("/", autenticarToken, verificarRol('ADMIN', 'AUDITOR', 'GERENTE'), buscarHistorialAuditorias);
router.get("/:id", autenticarToken, verificarRol('ADMIN', 'AUDITOR', 'GERENTE'), buscarHistorialAuditoriaId);
router.delete("/:id", autenticarToken, (req,res)=>res.status(403).json({error:'Acceso denegado.'}), eliminarHistorialAuditoria);
router.patch("/:id", autenticarToken, (req,res)=>res.status(403).json({error:'Acceso denegado.'}), actualizarHistorialAuditoria);

module.exports = router;
