// ============================================
// Rutas: Banco
// ============================================

const express = require("express");
const router = express.Router();

const { autenticarToken } = require('../middlewares/autenticarToken');
const { verificarRol } = require('../middlewares/verificarRol');
const { verificarPropiedad } = require('../middlewares/verificarPropiedad');


const {
  crearBanco,
  buscarBancos,
  buscarBancoId,
  eliminarBanco,
  actualizarBanco,
  desactivarBanco,
  reactivarBanco,
} = require("../controllers/BancoController");

router.post("/", autenticarToken, verificarRol('ADMIN'), crearBanco);
// GET: Staff necesita leer bancos para el selector en CrearUsuario (rol EMPLEADO/GERENTE)
router.get("/", autenticarToken, verificarRol('ADMIN', 'GERENTE', 'EMPLEADO'), buscarBancos);
router.get("/:id", autenticarToken, verificarRol('ADMIN'), buscarBancoId);
router.delete("/:id", autenticarToken, verificarRol('ADMIN'), eliminarBanco);
router.patch("/:id", autenticarToken, verificarRol('ADMIN'), actualizarBanco);
router.patch("/:id/desactivar", autenticarToken, verificarRol('ADMIN'), desactivarBanco);
router.patch("/:id/reactivar", autenticarToken, verificarRol('ADMIN'), reactivarBanco);

module.exports = router;