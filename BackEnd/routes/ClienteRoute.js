// ============================================
// Rutas: Cliente
// ============================================

const express = require("express");
const router = express.Router();

const { autenticarToken } = require('../middlewares/autenticarToken');
const { verificarRol } = require('../middlewares/verificarRol');
const { verificarPropiedad } = require('../middlewares/verificarPropiedad');


const {
  crearCliente,
  buscarClientes,
  buscarClienteId,
  eliminarCliente,
  actualizarCliente,
} = require("../controllers/ClienteController");

router.post("/", autenticarToken, verificarRol('ADMIN', 'EMPLEADO', 'GERENTE'), crearCliente);
router.get("/", autenticarToken, verificarRol('ADMIN', 'EMPLEADO', 'GERENTE', 'CLIENTE'), buscarClientes);
router.get("/:id", autenticarToken, verificarRol('ADMIN', 'EMPLEADO', 'GERENTE', 'CLIENTE'), verificarPropiedad('Cliente'), buscarClienteId);
router.delete("/:id", autenticarToken, verificarRol('ADMIN'), verificarPropiedad('Cliente'), eliminarCliente);
router.patch("/:id", autenticarToken, verificarRol('ADMIN', 'EMPLEADO', 'CLIENTE'), verificarPropiedad('Cliente'), actualizarCliente);

module.exports = router;
