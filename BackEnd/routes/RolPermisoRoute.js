// ============================================
// Rutas: RolPermiso
// ============================================

const express = require("express");
const router = express.Router();

const { autenticarToken } = require('../middlewares/autenticarToken');
const { verificarRol } = require('../middlewares/verificarRol');
const { verificarPropiedad } = require('../middlewares/verificarPropiedad');


const {
  crearRolPermiso,
  buscarRolesPermisos,
  buscarRolPermisoId,
  eliminarRolPermiso,
  actualizarRolPermiso,
} = require("../controllers/RolPermisoController");

router.post("/", autenticarToken, verificarRol('SUPER_ADMIN'), crearRolPermiso);
router.get("/", autenticarToken, verificarRol('SUPER_ADMIN'), buscarRolesPermisos);
router.get("/:id", autenticarToken, verificarRol('SUPER_ADMIN'), buscarRolPermisoId);
router.delete("/:id", autenticarToken, verificarRol('SUPER_ADMIN'), eliminarRolPermiso);
router.patch("/:id", autenticarToken, verificarRol('SUPER_ADMIN'), actualizarRolPermiso);

module.exports = router;
