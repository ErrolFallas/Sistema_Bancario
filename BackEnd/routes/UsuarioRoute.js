// ============================================
// Rutas: Usuario
// ============================================

const express = require("express");
const router = express.Router();

const {
  crearUsuario,
  buscarUsuarios,
  buscarUsuarioId,
  eliminarUsuario,
  actualizarUsuario,
} = require("../controllers/UsuarioController");

router.post("/", crearUsuario);
router.get("/", buscarUsuarios);
router.get("/:id", buscarUsuarioId);
router.delete("/:id", eliminarUsuario);
router.patch("/:id", actualizarUsuario);

module.exports = router;
