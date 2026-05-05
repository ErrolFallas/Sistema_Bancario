// ============================================
// Rutas: ClienteCuenta
// ============================================

const express = require("express");
const router = express.Router();

const { autenticarToken } = require('../middlewares/autenticarToken');
const { verificarRol } = require('../middlewares/verificarRol');
const { verificarPropiedad } = require('../middlewares/verificarPropiedad');


const {
  crearClienteCuenta,
  buscarClientesCuentas,
  buscarClienteCuentaId,
  eliminarClienteCuenta,
  actualizarClienteCuenta,
} = require("../controllers/ClienteCuentaController");

router.post("/", autenticarToken, verificarRol('ADMIN', 'EMPLEADO'), crearClienteCuenta);
router.get("/", autenticarToken, verificarRol('ADMIN', 'EMPLEADO'), buscarClientesCuentas);
router.get("/:id", autenticarToken, verificarRol('ADMIN', 'EMPLEADO'), buscarClienteCuentaId);
router.delete("/:id", autenticarToken, verificarRol('ADMIN', 'EMPLEADO'), eliminarClienteCuenta);
router.patch("/:id", autenticarToken, verificarRol('ADMIN', 'EMPLEADO'), actualizarClienteCuenta);

module.exports = router;
