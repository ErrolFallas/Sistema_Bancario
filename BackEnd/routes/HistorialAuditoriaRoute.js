// ============================================
// Rutas: HistorialAuditoria
// ============================================

const express = require("express");
const router = express.Router();

const {
  crearHistorialAuditoria,
  buscarHistorialAuditorias,
  buscarHistorialAuditoriaId,
  eliminarHistorialAuditoria,
  actualizarHistorialAuditoria,
} = require("../controllers/HistorialAuditoriaController");

router.post("/", crearHistorialAuditoria);
router.get("/", buscarHistorialAuditorias);
router.get("/:id", buscarHistorialAuditoriaId);
router.delete("/:id", eliminarHistorialAuditoria);
router.patch("/:id", actualizarHistorialAuditoria);

module.exports = router;
