// ============================================
// Rutas: MarcaTarjeta
// ============================================

const express = require("express");
const router = express.Router();

const { autenticarToken } = require('../middlewares/autenticarToken');
const { verificarRol } = require('../middlewares/verificarRol');
const { verificarPropiedad } = require('../middlewares/verificarPropiedad');


const {
  crearMarcaTarjeta,
  buscarMarcasTarjeta,
  buscarMarcaTarjetaId,
  eliminarMarcaTarjeta,
  actualizarMarcaTarjeta,
} = require("../controllers/MarcaTarjetaController");

router.post("/", autenticarToken, verificarRol('ADMIN'), crearMarcaTarjeta);
router.get("/", autenticarToken, buscarMarcasTarjeta);
router.get("/:id", autenticarToken, buscarMarcaTarjetaId);
router.delete("/:id", autenticarToken, verificarRol('ADMIN'), eliminarMarcaTarjeta);
router.patch("/:id", autenticarToken, verificarRol('ADMIN'), actualizarMarcaTarjeta);

module.exports = router;
