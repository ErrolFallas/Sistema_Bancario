// ============================================
// Rutas: Permiso
// ============================================

const express = require("express");
const router = express.Router();

const { autenticarToken } = require('../middlewares/autenticarToken');
const { verificarRol } = require('../middlewares/verificarRol');
const { verificarPropiedad } = require('../middlewares/verificarPropiedad');


const {
  crearPermiso,
  buscarPermisos,
  buscarPermisoId,
  eliminarPermiso,
  actualizarPermiso,
} = require("../controllers/PermisoController");

router.post("/", autenticarToken, verificarRol('SUPER_ADMIN'), crearPermiso);
router.get("/", autenticarToken, verificarRol('SUPER_ADMIN'), buscarPermisos);
router.get("/:id", autenticarToken, verificarRol('SUPER_ADMIN'), buscarPermisoId);
router.delete("/:id", autenticarToken, verificarRol('SUPER_ADMIN'), eliminarPermiso);
router.patch("/:id", autenticarToken, verificarRol('SUPER_ADMIN'), actualizarPermiso);

module.exports = router;
