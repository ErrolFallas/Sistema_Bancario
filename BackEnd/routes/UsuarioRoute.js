// ============================================
// Rutas: Usuario
// Todas las rutas requieren JWT válido.
// RBAC Jerárquico: SUPER_ADMIN > ADMIN > GERENTE > EMPLEADO > CLIENTE
// ─────────────────────────────────────────────
// El middleware verificarRol controla el ACCESO al endpoint.
// La lógica de puedeCrearRol (en controllers) controla QUÉ
// roles puede asignar cada actor. Son dos capas complementarias.
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
  desactivarUsuario,
  reactivarUsuario,
} = require('../controllers/UsuarioController');

const { autenticarToken } = require('../middlewares/autenticarToken');
const { verificarRol }    = require('../middlewares/verificarRol');

// Controller transaccional: crea Usuario + Cliente/Empleado en una sola operación
const { crearUsuarioCompleto } = require('../controllers/UsuarioCompletoController');

// ── Rutas protegidas por JWT ────────────────────────────────────────────

// Soft-delete: el propio usuario desactiva su cuenta (cualquier rol)
// ⚠️ Debe ir ANTES de /:id para que Express no la interprete como un param
router.patch('/eliminar-cuenta', autenticarToken, verificarRol('CLIENTE', 'EMPLEADO', 'GERENTE', 'ADMIN'), desactivarCuenta);

// Endpoint transaccional: crear usuario con cliente/empleado asociado
// ⚠️ Debe ir ANTES de /:id para que Express no lo interprete como un param
// ACCESO: ADMIN, GERENTE, EMPLEADO (cada uno filtrado por puedeCrearRol en controller)
router.post('/completo', autenticarToken, verificarRol('ADMIN', 'GERENTE', 'EMPLEADO'), crearUsuarioCompleto);

// Crear y listar usuarios: Staff bancario (ADMIN, GERENTE, EMPLEADO)
// La lógica de qué roles pueden crear se aplica en el controller
router.post('/',    autenticarToken, verificarRol('ADMIN', 'GERENTE', 'EMPLEADO'), crearUsuario);
router.get('/',     autenticarToken, verificarRol('ADMIN', 'GERENTE', 'EMPLEADO'), buscarUsuarios);

// Ver y editar: Staff bancario
router.get('/:id',    autenticarToken, verificarRol('ADMIN', 'GERENTE', 'EMPLEADO'), buscarUsuarioId);
router.patch('/:id',  autenticarToken, verificarRol('ADMIN', 'GERENTE', 'EMPLEADO'), actualizarUsuario);

// Soft-delete de otros usuarios: ADMIN y GERENTE (jerarquía validada en controller)
router.patch('/:id/desactivar', autenticarToken, verificarRol('ADMIN', 'GERENTE'), desactivarUsuario);
router.patch('/:id/reactivar', autenticarToken, verificarRol('ADMIN', 'GERENTE'), reactivarUsuario);

// Hard-delete: EXCLUSIVO para ADMIN
router.delete('/:id', autenticarToken, verificarRol('ADMIN'), eliminarUsuario);

module.exports = router;
