// ============================================
// Rutas: Usuario
// Todas las rutas requieren JWT válido.
// Rutas de admin requieren rol 'admin'.
// ============================================

const express = require('express');
const router  = express.Router();

const {
  crearUsuario,
  buscarUsuarios,
  buscarUsuarioId,
  actualizarUsuario,
  eliminarUsuario,
  desactivarCuenta,
} = require('../controllers/UsuarioController');

const { autenticarToken } = require('../middlewares/autenticarToken');
const { verificarRol }    = require('../middlewares/verificarRol');

// ── Rutas protegidas por JWT ────────────────────────────────────────────

// Soft-delete: el propio usuario desactiva su cuenta (cualquier rol)
// ⚠️ Debe ir ANTES de /:id para que Express no la interprete como un param
router.patch('/eliminar-cuenta', autenticarToken, desactivarCuenta);

// Solo ADMIN puede crear y listar todos los usuarios
router.post('/',    autenticarToken, verificarRol('admin'), crearUsuario);
router.get('/',     autenticarToken, verificarRol('admin'), buscarUsuarios);

// ADMIN puede ver y editar cualquier usuario
router.get('/:id',    autenticarToken, verificarRol('admin'), buscarUsuarioId);
router.patch('/:id',  autenticarToken, verificarRol('admin'), actualizarUsuario);

// Hard-delete: EXCLUSIVO para ADMIN
router.delete('/:id', autenticarToken, verificarRol('admin'), eliminarUsuario);

module.exports = router;
