// ============================================
// Rutas: Canal
// ============================================

const express = require("express");
const router = express.Router();

const { autenticarToken } = require('../middlewares/autenticarToken');
const { verificarRol } = require('../middlewares/verificarRol');
const { verificarPropiedad } = require('../middlewares/verificarPropiedad');


const {
  crearCanal,
  buscarCanales,
  buscarCanalId,
  eliminarCanal,
  actualizarCanal,
} = require("../controllers/CanalController");

router.post("/", autenticarToken, verificarRol('ADMIN'), crearCanal);
router.get("/", autenticarToken, buscarCanales);
router.get("/:id", autenticarToken, buscarCanalId);
router.delete("/:id", autenticarToken, verificarRol('ADMIN'), eliminarCanal);
router.patch("/:id", autenticarToken, verificarRol('ADMIN'), actualizarCanal);

module.exports = router;
