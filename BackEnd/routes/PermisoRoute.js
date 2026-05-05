// ============================================
// Rutas: Permiso
// ============================================

const express = require("express");
const router = express.Router();

const {
  crearPermiso,
  buscarPermisos,
  buscarPermisoId,
  eliminarPermiso,
  actualizarPermiso,
} = require("../controllers/PermisoController");

router.post("/", crearPermiso);
router.get("/", buscarPermisos);
router.get("/:id", buscarPermisoId);
router.delete("/:id", eliminarPermiso);
router.patch("/:id", actualizarPermiso);

module.exports = router;
