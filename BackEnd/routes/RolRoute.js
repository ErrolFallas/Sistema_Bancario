// ============================================
// Rutas: Rol
// ============================================

const express = require("express");
const router = express.Router();

const {
  crearRol,
  buscarRoles,
  buscarRolId,
  eliminarRol,
  actualizarRol,
} = require("../controllers/RolController");

router.post("/", crearRol);
router.get("/", buscarRoles);
router.get("/:id", buscarRolId);
router.delete("/:id", eliminarRol);
router.patch("/:id", actualizarRol);

module.exports = router;
