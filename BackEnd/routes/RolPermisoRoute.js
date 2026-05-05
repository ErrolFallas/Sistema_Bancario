// ============================================
// Rutas: RolPermiso
// ============================================

const express = require("express");
const router = express.Router();

const {
  crearRolPermiso,
  buscarRolesPermisos,
  buscarRolPermisoId,
  eliminarRolPermiso,
  actualizarRolPermiso,
} = require("../controllers/RolPermisoController");

router.post("/", crearRolPermiso);
router.get("/", buscarRolesPermisos);
router.get("/:id", buscarRolPermisoId);
router.delete("/:id", eliminarRolPermiso);
router.patch("/:id", actualizarRolPermiso);

module.exports = router;
