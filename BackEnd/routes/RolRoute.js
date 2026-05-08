// ============================================
// Rutas: Rol
// ============================================

const express = require("express");
const router = express.Router();

const { autenticarToken } = require('../middlewares/autenticarToken');
const { verificarRol } = require('../middlewares/verificarRol');
const { verificarPropiedad } = require('../middlewares/verificarPropiedad');


const {
  crearRol,
  buscarRoles,
  buscarRolId,
  eliminarRol,
  actualizarRol,
  desactivarRol,
  reactivarRol,
} = require("../controllers/RolController");

router.post("/", autenticarToken, verificarRol('SUPER_ADMIN'), crearRol);
// GET: Staff necesita leer roles para el selector en CrearUsuario/EditarUsuario
router.get("/", autenticarToken, verificarRol('ADMIN', 'GERENTE', 'EMPLEADO'), buscarRoles);
router.get("/:id", autenticarToken, verificarRol('SUPER_ADMIN'), buscarRolId);
router.delete("/:id", autenticarToken, verificarRol('SUPER_ADMIN'), eliminarRol);
router.patch("/:id", autenticarToken, verificarRol('SUPER_ADMIN'), actualizarRol);
router.patch("/:id/desactivar", autenticarToken, verificarRol('SUPER_ADMIN'), desactivarRol);
router.patch("/:id/reactivar", autenticarToken, verificarRol('SUPER_ADMIN'), reactivarRol);

module.exports = router;
