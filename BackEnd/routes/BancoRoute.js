// ============================================
// Rutas: Banco
// ============================================

const express = require("express");
const router = express.Router();

const {
  crearBanco,
  buscarBancos,
  buscarBancoId,
  eliminarBanco,
  actualizarBanco,
} = require("../controllers/BancoController");

router.post("/", crearBanco);
router.get("/", buscarBancos);
router.get("/:id", buscarBancoId);
router.delete("/:id", eliminarBanco);
router.patch("/:id", actualizarBanco);

module.exports = router;