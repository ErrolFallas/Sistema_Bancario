// ============================================
// Rutas: EstadoTransaccion
// ============================================

const express = require("express");
const router = express.Router();

const { autenticarToken } = require('../middlewares/autenticarToken');
const { verificarRol } = require('../middlewares/verificarRol');
const { verificarPropiedad } = require('../middlewares/verificarPropiedad');


const {
  crearEstadoTransaccion,
  buscarEstadosTransaccion,
  buscarEstadoTransaccionId,
  eliminarEstadoTransaccion,
  actualizarEstadoTransaccion,
} = require("../controllers/EstadoTransaccionController");

router.post("/", autenticarToken, verificarRol('ADMIN'), crearEstadoTransaccion);
router.get("/", autenticarToken, buscarEstadosTransaccion);
router.get("/:id", autenticarToken, buscarEstadoTransaccionId);
router.delete("/:id", autenticarToken, verificarRol('ADMIN'), eliminarEstadoTransaccion);
router.patch("/:id", autenticarToken, verificarRol('ADMIN'), actualizarEstadoTransaccion);

module.exports = router;
