// ============================================
// Rutas: Canal
// ============================================

const express = require("express");
const router = express.Router();

const {
  crearCanal,
  buscarCanales,
  buscarCanalId,
  eliminarCanal,
  actualizarCanal,
} = require("../controllers/CanalController");

router.post("/", crearCanal);
router.get("/", buscarCanales);
router.get("/:id", buscarCanalId);
router.delete("/:id", eliminarCanal);
router.patch("/:id", actualizarCanal);

module.exports = router;
