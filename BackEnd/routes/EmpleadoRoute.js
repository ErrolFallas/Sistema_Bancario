// ============================================
// Rutas: Empleado
// ============================================

const express = require("express");
const router = express.Router();

const { autenticarToken } = require('../middlewares/autenticarToken');
const { verificarRol } = require('../middlewares/verificarRol');
const { verificarPropiedad } = require('../middlewares/verificarPropiedad');


const {
  crearEmpleado,
  buscarEmpleados,
  buscarEmpleadoId,
  eliminarEmpleado,
  actualizarEmpleado,
} = require("../controllers/EmpleadoController");

router.post("/", autenticarToken, verificarRol('ADMIN'), crearEmpleado);
router.get("/", autenticarToken, verificarRol('ADMIN'), buscarEmpleados);
router.get("/:id", autenticarToken, verificarRol('ADMIN'), buscarEmpleadoId);
router.delete("/:id", autenticarToken, verificarRol('ADMIN'), eliminarEmpleado);
router.patch("/:id", autenticarToken, verificarRol('ADMIN'), actualizarEmpleado);

module.exports = router;
