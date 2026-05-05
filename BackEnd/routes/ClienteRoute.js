// ============================================
// Rutas: Cliente
// ============================================

const express = require("express");
const router = express.Router();

const {
  crearCliente,
  buscarClientes,
  buscarClienteId,
  eliminarCliente,
  actualizarCliente,
} = require("../controllers/ClienteController");

router.post("/", crearCliente);
router.get("/", buscarClientes);
router.get("/:id", buscarClienteId);
router.delete("/:id", eliminarCliente);
router.patch("/:id", actualizarCliente);

module.exports = router;
