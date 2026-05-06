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

// Controller transaccional: crea Usuario + Cliente/Empleado en una sola operación
const { crearUsuarioCompleto } = require('../controllers/UsuarioCompletoController');

// ── Rutas protegidas por JWT ────────────────────────────────────────────

// Soft-delete: el propio usuario desactiva su cuenta (cualquier rol)
// ⚠️ Debe ir ANTES de /:id para que Express no la interprete como un param
router.patch('/eliminar-cuenta', autenticarToken, verificarRol('CLIENTE', 'EMPLEADO'), desactivarCuenta);

// Endpoint transaccional: crear usuario con cliente/empleado asociado
// ⚠️ Debe ir ANTES de /:id para que Express no lo interprete como un param
router.post('/completo', autenticarToken, verificarRol('ADMIN'), crearUsuarioCompleto);

// Solo ADMIN puede crear y listar todos los usuarios
router.post('/',    autenticarToken, verificarRol('ADMIN'), crearUsuario);
router.get('/',     autenticarToken, verificarRol('ADMIN'), buscarUsuarios);

// ADMIN puede ver y editar cualquier usuario
router.get('/:id',    autenticarToken, verificarRol('ADMIN'), buscarUsuarioId);
router.patch('/:id',  autenticarToken, verificarRol('ADMIN'), actualizarUsuario);

// Hard-delete: EXCLUSIVO para ADMIN
router.delete('/:id', autenticarToken, verificarRol('ADMIN'), eliminarUsuario);

module.exports = router;
