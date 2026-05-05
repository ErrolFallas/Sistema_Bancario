// ============================================
// Rutas: Empleado
// ============================================

const express = require("express");
const router = express.Router();

const {
  crearEmpleado,
  buscarEmpleados,
  buscarEmpleadoId,
  eliminarEmpleado,
  actualizarEmpleado,
} = require("../controllers/EmpleadoController");

router.post("/", crearEmpleado);
router.get("/", buscarEmpleados);
router.get("/:id", buscarEmpleadoId);
router.delete("/:id", eliminarEmpleado);
router.patch("/:id", actualizarEmpleado);

module.exports = router;
